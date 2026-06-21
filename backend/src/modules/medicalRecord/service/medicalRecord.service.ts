import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { logger } from '../../../core/logger/logger'
import { IDoctorRepository } from '../../../modules/doctor/interfaces/doctor.repository.interface'
import { IPatientRepository } from '../../../modules/patient/interfaces/patient.repository.interface'
import { IPrescriptionRepository } from '../../../modules/prescription/interfaces/prescription.repository.interface'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { IVitalRepository } from '../../vital/interfaces/vital.repository.interface'
import { IMedicalRecordRepository } from '../interfaces/medicalRecord.repository.interface'
import { IMedicalRecordService } from '../interfaces/medicalRecord.service.interface'
import { IClinicalNote, MedicalRecordDocument,MedicalRecordDTO } from '../types/medicalRecord.types'

@injectable()
export class MedicalRecordService implements IMedicalRecordService {
    constructor(
        @inject(TOKENS.IMedicalRecordRepository) private _medicalRecordRepo: IMedicalRecordRepository,
        @inject(TOKENS.IDoctorRepository) private _doctorRepo: IDoctorRepository,
        @inject(TOKENS.IPatientRepository) private _patientRepo: IPatientRepository,
        @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
        @inject(TOKENS.IVitalRepository) private _vitalRepo: IVitalRepository,
        @inject(TOKENS.IPrescriptionRepository) private _prescriptionRepo: IPrescriptionRepository,
    ) {}

    private async resolveDoctorPatientContext(doctorId: string, patientId: string) {
        const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(doctorId))
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor profile not found')
        }

        const patient = await this._patientRepo.findById(patientId)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient not found')
        }

        if (patient.primaryDoctorId?.toString() !== doctor._id.toString()) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'You are not authorized to view this patient')
        }

        return { doctor, patient }
    }

    private async buildMedicalRecordDTO(
        patientId: string,
        patient: Awaited<ReturnType<IPatientRepository['findById']>>,
    ): Promise<MedicalRecordDTO> {
        const user = await this._userRepo.findById(patient!.userId.toString())
        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        const age = Math.floor((Date.now() - new Date(patient!.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))

        const [vitals, prescriptions, medicalRecord] = await Promise.all([
            this._vitalRepo.findLatestRecordedSchedulesByPatientId(patient!._id),
            this._prescriptionRepo.findByPatientId(patient!._id.toString()),
            this._medicalRecordRepo.findByPatientId(patient!._id.toString()),
        ])
        logger.info({ Vitals: vitals })

        return {
            _id: medicalRecord?._id?.toString() || '',
            patientId: patient?.patientId.toString() || '',
            patientName: user.name,
            age,
            gender: patient!.gender,
            profileImage: patient!.profileImage,
            conditions: patient!.conditions || [],
            riskLevel: patient!.riskLevel || '',
            clinicalStatus: patient!.clinicalStatus || 'active',
            allergies: medicalRecord?.allergies || [],
            pastSurgeries: medicalRecord?.pastSurgeries || '',
            clinicalNotes: (medicalRecord?.clinicalNotes as IClinicalNote[]) || [],
            vitals: vitals.map((v) => ({
                _id: v._id.toString(),
                type: v.vitalType,
                value: v.recordedValue?.value,
                systolic: v.recordedValue?.systolic,
                diastolic: v.recordedValue?.diastolic,
                unit: v.recordedValue?.unit || '',
                recordedAt: v.recordedAt?.toISOString() || v.scheduleDate.toISOString(),
            })),
            prescriptions: prescriptions.map((p) => ({
                _id: p._id.toString(),
                medications: p.medications.map((m) => ({
                    name: m.name,
                    dosage: m.dosage,
                    frequency: m.frequency,
                    route: m.route,
                    scheduleTimes: m.scheduleTimes,
                    status: p.status,
                })),
                status: p.status,
                prescribedAt: p.prescribedAt.toISOString(),
            })),
        }
    }

    async getMedicalRecord(doctorId: string, patientId: string): Promise<MedicalRecordDTO> {
        const { patient } = await this.resolveDoctorPatientContext(doctorId, patientId)
        return this.buildMedicalRecordDTO(patientId, patient)
    }

    async updateMedicalRecord(
        doctorId: string,
        patientId: string,
        data: { allergies?: string[]; pastSurgeries?: string },
    ): Promise<MedicalRecordDTO> {
        const { patient } = await this.resolveDoctorPatientContext(doctorId, patientId)

        const updateData: Partial<MedicalRecordDocument> = {}
        if (data.allergies !== undefined) updateData.allergies = data.allergies
        if (data.pastSurgeries !== undefined) updateData.pastSurgeries = data.pastSurgeries

        await this._medicalRecordRepo.upsert(patient!._id.toString(), updateData)

        return this.buildMedicalRecordDTO(patientId, patient)
    }

    async addClinicalNote(doctorId: string, patientId: string, note: string): Promise<MedicalRecordDTO> {
        const { doctor, patient } = await this.resolveDoctorPatientContext(doctorId, patientId)

        const doctorUser = await this._userRepo.findById(doctor.userId.toString())
        const clinicalNote: IClinicalNote = {
            note,
            doctorName: doctorUser?.name || 'Doctor',
        }

        await this._medicalRecordRepo.addClinicalNote(patient!._id.toString(), clinicalNote)

        return this.buildMedicalRecordDTO(patientId, patient)
    }
}
