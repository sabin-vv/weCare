import { Types, UpdateWriteOpResult } from 'mongoose'
import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IPrescriptionRepository } from '../interfaces/prescription.repository.interface'
import { PrescriptionModel } from '../models/prescription.model'
import { PrescriptionDocument, PrescriptionStatus } from '../types/prescription.types'

@injectable()
export class PrescriptionRepository extends BaseRepository<PrescriptionDocument> implements IPrescriptionRepository {
    constructor() {
        super(PrescriptionModel)
    }

    async findByPatientId(patientId: string): Promise<PrescriptionDocument[]> {
        return await this.model
            .find({ patientId })
            .sort({ prescribedAt: -1, createdAt: -1 })
            .populate({ path: 'prescribedBy', populate: { path: 'userId', select: 'name email' } })
    }

    async findByPatientIdWithPagination(
        patientId: string,
        page: number,
        limit: number,
        status?: string,
    ): Promise<{ data: PrescriptionDocument[]; total: number }> {
        const filter: Record<string, unknown> = { patientId }
        if (status) {
            filter.status = status
        }

        const [data, total] = await Promise.all([
            this.model
                .find(filter)
                .sort({ prescribedAt: -1, createdAt: -1 })
                .populate({ path: 'prescribedBy', populate: { path: 'userId', select: 'name email' } })
                .skip((page - 1) * limit)
                .limit(limit),
            this.model.countDocuments(filter),
        ])

        return { data, total }
    }

    async updateStatus(
        id: string,
        data: Partial<Pick<PrescriptionDocument, 'status' | 'discontinuedAt' | 'discontinuedBy' | 'endDate'>>,
    ): Promise<PrescriptionDocument | null> {
        return await this.model.findByIdAndUpdate(id, data, { returnDocument: 'after' })
    }

    async findByPatientIdAndStatus(patientId: string, status: PrescriptionStatus): Promise<PrescriptionDocument[]> {
        return await this.model
            .find({ patientId, status })
            .sort({ prescribedAt: -1, createdAt: -1 })
            .populate({ path: 'prescribedBy', populate: { path: 'userId', select: 'name email' } })
    }
    async pausePrescription(patientId: string) {
        return await this.model.updateMany(
            { patientId: new Types.ObjectId(patientId), status: 'active' },
            {
                $set: { status: 'on_hold' },
            },
        )
    }
    async completePrescription(patientId: string): Promise<UpdateWriteOpResult> {
        return await this.model.updateMany(
            {
                patientId: new Types.ObjectId(patientId),
                status: { $in: ['active', 'on_hold'] },
            },
            {
                $set: {
                    status: 'completed',
                },
            },
        )
    }
    async discontinuePrescriptionByPatientId(patientId: string, discontinuedBy: string): Promise<number> {
        const now = new Date()
        const result = await this.model.updateMany(
            { patientId: new Types.ObjectId(patientId), status: 'active' },
            {
                $set: {
                    status: 'discontinued',
                    discontinuedAt: now,
                    discontinuedBy: new Types.ObjectId(discontinuedBy),
                },
            },
        )
        return result.modifiedCount
    }
    async resumePrescription(patientId: string): Promise<UpdateWriteOpResult> {
        return await this.model.updateMany(
            {
                patientId: new Types.ObjectId(patientId),
                status: 'on_hold',
            },
            {
                $set: {
                    status: 'active',
                },
            },
        )
    }
}
