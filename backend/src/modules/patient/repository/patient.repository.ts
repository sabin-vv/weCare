import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IPatientRepository, ListPatientParams } from '../interfaces/patient.repository.interface'
import { PatientModel } from '../models/patient.model'
import { PatientDocument } from '../types/patient.types'

@injectable()
export class PatientRepository extends BaseRepository<PatientDocument> implements IPatientRepository {
    constructor() {
        super(PatientModel)
    }

    async findById(id: string): Promise<PatientDocument | null> {
        if (!Types.ObjectId.isValid(id)) return null
        return this.model.findById(id).lean()
    }

    async findByUserId(userId: Types.ObjectId): Promise<PatientDocument | null> {
        return this.model.findOne({ userId })
    }

    async updateById(id: string, data: Partial<PatientDocument>): Promise<PatientDocument | null> {
        if (!Types.ObjectId.isValid(id)) return null
        return this.model.findByIdAndUpdate(id, data, { returnDocument: 'after' })
    }

    async updateByUserId(userId: Types.ObjectId, data: Partial<PatientDocument>): Promise<PatientDocument | null> {
        return this.model.findOneAndUpdate({ userId }, data, { returnDocument: 'after' })
    }

    async getLastPatientId(): Promise<string | null> {
        const lastPatient = await this.model.findOne().sort({ patientId: -1 }).select('patientId').lean()
        return lastPatient?.patientId || null
    }

    async listPatientsByDoctor(params: ListPatientParams): Promise<{ data: PatientDocument[]; total: number }> {
        const { search, filter, page, limit, userIds, excludeUserIds } = params
        const pageSafe = Math.max(1, page || 1)
        const limitSafe = Math.max(1, limit || 8)
        const query: Record<string, unknown> = {}

        if (filter === 'high_risk') {
            query.riskLevel = 'high_risk'
        } else if (filter === 'hospitalized') {
            query.clinicalStatus = 'hospitalized'
        }

        const skip = (pageSafe - 1) * limitSafe

        if (search) {
            query.$or = [{ patientId: { $regex: search, $options: 'i' } }]
        }

        if (userIds && userIds.length > 0) {
            query.userId = { $in: userIds }
        }

        if (excludeUserIds && excludeUserIds.length > 0) {
            query.userId = query.userId
                ? { ...(query.userId as Record<string, unknown>), $nin: excludeUserIds }
                : { $nin: excludeUserIds }
        }

        const [data, total] = await Promise.all([
            this.model.find(query).sort({ patientId: 1 }).skip(skip).limit(limitSafe).lean(),

            this.model.countDocuments(query),
        ])

        return { data, total }
    }
}
