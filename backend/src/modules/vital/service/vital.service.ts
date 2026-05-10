import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'
import { IVitalRepository } from '../interfaces/vital.repository.interface'
import { IVitalService } from '../interfaces/vital.service.interface'
import { VitalDocument } from '../types/vital.types'
import { CreateVitalDTO } from '../validator/vital.schema'

@injectable()
export class VitalService implements IVitalService {
    constructor(
        @inject(TOKENS.IVitalRepository) private _vitalRepo: IVitalRepository,
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
}
