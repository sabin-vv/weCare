import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IDoctorRepository } from '../../doctor/interfaces/doctor.repository.interface'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'
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
    ) {}

    async createPrescription(doctorUserId: string, dto: CreatePrescriptionDTO): Promise<PrescriptionDocument> {
        const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(doctorUserId))
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor profile not found')
        }

        const patient = await this._patientRepo.findById(dto.patientId)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient not found')
        }

        return await this._prescriptionRepo.create({
            patientId: patient._id,
            prescribedBy: doctor._id,
            medications: dto.medications,
            note: dto.note,
            status: dto.status ?? 'active',
            prescribedAt: new Date(),
        })
    }

    async getPatientPrescriptions(patientId: string, status?: string): Promise<PrescriptionDocument[]> {
        const patient = await this._patientRepo.findById(patientId)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient not found')
        }

        if (status) {
            return await this._prescriptionRepo.findByPatientIdAndStatus(patientId, status as PrescriptionDocument['status'])
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
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor profile not found')
        }

        const prescription = await this._prescriptionRepo.findById(prescriptionId)
        if (!prescription) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Prescription not found')
        }

        const updated = await this._prescriptionRepo.updateStatus(prescriptionId, {
            status: dto.status,
            discontinuedAt: dto.status === 'discontinued' ? new Date() : undefined,
            discontinuedBy: dto.status === 'discontinued' ? (doctor._id as Types.ObjectId) : undefined,
        })

        if (!updated) {
            throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update prescription status')
        }

        return updated
    }
}
