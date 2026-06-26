import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IActivityLogService } from '../../activityLog/interfaces/activityLog.service.interface'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { IDoctorRepository } from '../../doctor/interfaces/doctor.repository.interface'
import { INotificationService } from '../../notification/interfaces/notification.service.interface'
import { CreateNotificationPayload } from '../../notification/types/notification.types'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'
import { MSG } from '../constants/messages'
import { IPrescriptionRepository } from '../interfaces/prescription.repository.interface'
import { IPrescriptionService } from '../interfaces/prescription.service.interface'
import { PrescriptionDocument } from '../types/prescription.types'
import { CreatePrescriptionDTO, UpdatePrescriptionStatusDTO } from '../validator/prescription.schema'

@injectable()
export class PrescriptionService implements IPrescriptionService {
    constructor(
        @inject(TOKENS.IPrescriptionRepository) private _prescriptionRepo: IPrescriptionRepository,
        @inject(TOKENS.IDoctorRepository) private _doctorRepo: IDoctorRepository,
        @inject(TOKENS.IPatientRepository) private _patientRepo: IPatientRepository,
        @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
        @inject(TOKENS.INotificationService) private _notificationService: INotificationService,
        @inject(TOKENS.IActivityLogService) private _activityLogService: IActivityLogService,
    ) {}

    async createPrescription(doctorUserId: string, dto: CreatePrescriptionDTO): Promise<PrescriptionDocument> {
        const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(doctorUserId))
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.DOCTOR_PROFILE_NOT_FOUND)
        }

        const patient = await this._patientRepo.findById(dto.patientId)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PATIENT_NOT_FOUND)
        }

        const prescribedAt = new Date()

        const calculateEndDate = (duration: number, unit: 'Days' | 'Weeks' | 'Months'): Date => {
            const date = new Date(prescribedAt)
            switch (unit) {
                case 'Days':
                    date.setDate(date.getDate() + duration)
                    break
                case 'Weeks':
                    date.setDate(date.getDate() + duration * 7)
                    break
                case 'Months':
                    date.setMonth(date.getMonth() + duration)
                    break
            }
            return date
        }

        const medications = dto.medications.map((med) => ({
            ...med,
            endDate: calculateEndDate(med.duration, med.durationUnit as 'Days' | 'Weeks' | 'Months'),
        }))

        const prescriptionEndDate = new Date(Math.max(...medications.map((m) => m.endDate!.getTime())))

        const prescription = await this._prescriptionRepo.create({
            patientId: patient._id,
            prescribedBy: doctor._id,
            medications,
            note: dto.note,
            status: dto.status ?? 'active',
            prescribedAt,
            endDate: prescriptionEndDate,
        })

        const doctorUser = await this._doctorRepo.findByIdWithUser(doctor._id.toString()).catch(() => null)
        const doctorName = (doctorUser?.userId as unknown as { name?: string })?.name ?? 'Doctor'

        const createPayload: CreateNotificationPayload = {
            recipientId: patient.userId.toString(),
            recipientRole: 'patient',
            type: 'prescription_updated',
            title: 'New Prescription Added',
            message: `Dr. ${doctorName} has added a new prescription ${dto.medications.map((m) => m.name).join(', ')}`,
            metadata: {
                prescriptionId: prescription._id.toString(),
                type: 'created',
            },
        }
        await this._notificationService.createNotification(createPayload).catch(() => null)

        const user = await this._userRepo.findById(patient.userId.toString())
        const patientName = user?.name ?? MSG.UNKNOWN_PATIENT

        await this._activityLogService.logActivity({
            performedBy: doctorUserId,
            performedByRole: 'doctor',
            category: 'prescription',
            action: 'prescription_created',
            targetId: prescription._id.toString(),
            targetType: 'prescription',
            description: `Prescription created for ${patientName}: ${medications.map((m) => `${m.name} (${m.dosage})`).join(', ')}`,
        })

        return prescription
    }

    async getPatientPrescriptions(patientId: string, status?: string): Promise<PrescriptionDocument[]> {
        const patient = await this._patientRepo.findById(patientId)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PATIENT_NOT_FOUND)
        }

        if (status) {
            return await this._prescriptionRepo.findByPatientIdAndStatus(
                patientId,
                status as PrescriptionDocument['status'],
            )
        }

        return await this._prescriptionRepo.findByPatientId(patientId)
    }

    async updatePrescriptionStatus(
        doctorUserId: string,
        prescriptionId: string,
        dto: UpdatePrescriptionStatusDTO,
    ): Promise<PrescriptionDocument> {
        const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(doctorUserId))
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.DOCTOR_PROFILE_NOT_FOUND)
        }

        const prescription = await this._prescriptionRepo.findById(prescriptionId)
        if (!prescription) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.NOT_FOUND)
        }

        const updated = await this._prescriptionRepo.updateStatus(prescriptionId, {
            status: dto.status,
            discontinuedAt: dto.status === 'discontinued' ? new Date() : undefined,
            discontinuedBy: dto.status === 'discontinued' ? (doctor._id as Types.ObjectId) : undefined,
            endDate: dto.status === 'completed' ? new Date() : undefined,
        })

        if (!updated) {
            throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, MSG.FAILED_UPDATE_STATUS)
        }

        const presPatient = await this._patientRepo.findById(prescription.patientId.toString())
        let presPatientName = MSG.UNKNOWN_PATIENT
        if (presPatient) {
            const presUser = await this._userRepo.findById(presPatient.userId.toString())
            presPatientName = presUser?.name ?? MSG.UNKNOWN_PATIENT
        }

        if (dto.status === 'discontinued') {
            await this._activityLogService.logActivity({
                performedBy: doctorUserId,
                performedByRole: 'doctor',
                category: 'prescription',
                action: 'prescription_discontinued',
                targetId: prescriptionId,
                targetType: 'prescription',
                description: `Prescription discontinued for ${presPatientName}: ${prescription.medications.map((m) => `${m.name} (${m.dosage})`).join(', ')}`,
            })
        } else {
            await this._activityLogService.logActivity({
                performedBy: doctorUserId,
                performedByRole: 'doctor',
                category: 'prescription',
                action: 'prescription_updated',
                targetId: prescriptionId,
                targetType: 'prescription',
                description: `Prescription ${dto.status} for ${presPatientName}: ${prescription.medications.map((m) => `${m.name} (${m.dosage})`).join(', ')}`,
            })
        }

        return updated
    }
}
