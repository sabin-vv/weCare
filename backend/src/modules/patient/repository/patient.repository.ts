import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IPatientRepository } from '../interfaces/patient.repository.interface'
import { PatientModel } from '../models/patient.model'
import { ListPatientParams, PatientDocument } from '../types/patient.types'

@injectable()
export class PatientRepository extends BaseRepository<PatientDocument> implements IPatientRepository {
    constructor() {
        super(PatientModel)
    }

    async findById(id: string): Promise<PatientDocument | null> {
        if (!Types.ObjectId.isValid(id)) return null
        return this.model.findById(id).lean()
    }

    async findByPatientId(patientId: string): Promise<PatientDocument | null> {
        return this.model.findOne({ patientId }).lean()
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
        const {
            search,
            page,
            limit,
            primaryDoctorId,
            clinicalStatus,
            riskLevel,
            searchUserIds,
            userIds,
            excludeUserIds,
        } = params
        const pageSafe = Math.max(1, page || 1)
        const limitSafe = Math.max(1, limit || 8)
        const query: Record<string, unknown> = {
            primaryDoctorId,
        }

        if (clinicalStatus && clinicalStatus !== 'all') {
            query.clinicalStatus = clinicalStatus
        }

        if (riskLevel && riskLevel !== 'all') {
            query.riskLevel = riskLevel
        }

        const skip = (pageSafe - 1) * limitSafe

        if (search) {
            const searchConditions: Record<string, unknown>[] = [{ patientId: { $regex: search, $options: 'i' } }]

            if (searchUserIds && searchUserIds.length > 0) {
                searchConditions.push({ userId: { $in: searchUserIds } })
            }

            query.$or = searchConditions
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

    async removeCaregiver(patientId: string): Promise<number> {
        const result = await this.model.updateOne(
            { _id: new Types.ObjectId(patientId) },
            {
                $set: { caregiverId: null },
            },
        )
        return result.modifiedCount
    }
}
