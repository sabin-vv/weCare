import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IDoctorRepository } from '../../doctor/interfaces/doctor.repository.interface'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'
import { IVitalRepository } from '../interfaces/vital.repository.interface'
import { IVitalService } from '../interfaces/vital.service.interface'
import { VitalDocument, VitalPlanDocument } from '../types/vital.types'
import { CreateVitalDTO, CreateVitalPlanDTO } from '../validator/vital.schema'

@injectable()
export class VitalService implements IVitalService {
    constructor(
        @inject(TOKENS.IVitalRepository) private _vitalRepo: IVitalRepository,
        @inject(TOKENS.IDoctorRepository) private _doctorRepo: IDoctorRepository,
        @inject(TOKENS.IPatientRepository) private _patientRepo: IPatientRepository,
    ) {}

    async createVital(recordedBy: string, dto: CreateVitalDTO): Promise<VitalDocument> {
        const patient = await this._patientRepo.findById(dto.patientId)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient not found')
        }

        return await this._vitalRepo.create({
            patientId: patient._id,
            type: dto.type,
            value: dto.value,
            systolic: dto.systolic,
            diastolic: dto.diastolic,
            unit: dto.unit,
            recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : new Date(),
            recordedBy: new Types.ObjectId(recordedBy),
        })
    }

    async getPatientVitals(patientId: string, type?: string): Promise<VitalDocument[]> {
        const patient = await this._patientRepo.findById(patientId)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient not found')
        }

        if (type) {
            return await this._vitalRepo.findByPatientIdAndType(patientId, type as VitalDocument['type'])
        }

        return await this._vitalRepo.findByPatientId(patientId)
    }

    async createVitalPlan(doctorUserId: string, dto: CreateVitalPlanDTO): Promise<VitalPlanDocument> {
        const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(doctorUserId))
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor profile not found')
        }

        const patient = await this._patientRepo.findById(dto.patientId)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient not found')
        }

        return await this._vitalRepo.createVitalPlan({
            patientId: patient._id,
            requestedBy: doctor._id,
            vitals: dto.vitals,
            instructions: dto.instructions,
            status: dto.status ?? 'active',
        })
    }

    async getPatientVitalPlans(patientId: string, status?: string): Promise<VitalPlanDocument[]> {
        const patient = await this._patientRepo.findById(patientId)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient not found')
        }

        if (status) {
            return await this._vitalRepo.findVitalPlansByPatientIdAndStatus(patientId, status as VitalPlanDocument['status'])
        }

        return await this._vitalRepo.findVitalPlansByPatientId(patientId)
    }
}
