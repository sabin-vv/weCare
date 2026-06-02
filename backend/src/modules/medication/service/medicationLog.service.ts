import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { IMedicationLogRepository } from '../interfaces/medicationLog.repository.interface'
import { IMedicationLogService } from '../interfaces/medicationLog.service.interface'
import { MedicationLogDocument } from '../types/medicationLog.types'
import { CreateMedicationLogDTO } from '../validator/medicationLog.schema'

@injectable()
export class MedicationLogService implements IMedicationLogService {
    constructor(@inject(TOKENS.IMedicationLogRepository) private readonly repository: IMedicationLogRepository) {}

    async create(userId: string, dto: CreateMedicationLogDTO): Promise<MedicationLogDocument> {
        return this.repository.create({
            ...dto,
            caregiverId: new Types.ObjectId(userId),
            patientId: new Types.ObjectId(dto.patientId),
            scheduleId: new Types.ObjectId(dto.medicationId),
            takenTime: new Date(dto.takenTime),
            observations: dto.observations ?? '',
        })
    }

    async getPatientLogs(patientId: string): Promise<MedicationLogDocument[]> {
        return this.repository.findByPatientId(patientId)
    }
}
