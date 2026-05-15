import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { IVitalLogRepository } from '../interfaces/vitalLog.repository.interface'
import { IVitalLogService } from '../interfaces/vitalLog.service.interface'
import { VitalLogDocument } from '../types/vitalLog.types'
import { CreateVitalLogDTO } from '../validator/vitalLog.schema'

@injectable()
export class VitalLogService implements IVitalLogService {
    constructor(@inject(TOKENS.IVitalLogRepository) private readonly repository: IVitalLogRepository) {}

    async create(userId: string, dto: CreateVitalLogDTO): Promise<VitalLogDocument> {
        return this.repository.create({
            ...dto,
            caregiverId: new Types.ObjectId(userId),
            patientId: new Types.ObjectId(dto.patientId),
            recordedAt: new Date(dto.recordedAt),
            notes: dto.notes ?? '',
        })
    }

    async getPatientLogs(patientId: string): Promise<VitalLogDocument[]> {
        return this.repository.findByPatientId(patientId)
    }
}
