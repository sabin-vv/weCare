import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { ISymptomLogRepository } from '../interfaces/symptomLog.repository.interface'
import { ISymptomLogService } from '../interfaces/symptomLog.service.interface'
import { SymptomLogDocument } from '../types/symptomLog.types'
import { CreateSymptomLogDTO } from '../validator/symptomLog.schema'

@injectable()
export class SymptomLogService implements ISymptomLogService {
    constructor(@inject(TOKENS.ISymptomLogRepository) private readonly repository: ISymptomLogRepository) {}

    async create(userId: string, dto: CreateSymptomLogDTO): Promise<SymptomLogDocument> {
        return this.repository.create({
            ...dto,
            caregiverId: new Types.ObjectId(userId),
            patientId: new Types.ObjectId(dto.patientId),
            onsetTime: new Date(dto.onsetTime),
            observations: dto.observations ?? '',
        })
    }

    async getPatientLogs(patientId: string): Promise<SymptomLogDocument[]> {
        return this.repository.findByPatientId(patientId)
    }
}
