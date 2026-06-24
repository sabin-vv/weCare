import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IAlertRepository } from '../interfaces/alert.repository.interface'
import { alertModel } from '../models/alert.model'
import { AlertDocument } from '../types/alert.types'

@injectable()
export class AlertRepository extends BaseRepository<AlertDocument> implements IAlertRepository {
    constructor() {
        super(alertModel)
    }

    async findByPatientId(
        patientId: string,
        filter: Record<string, unknown> = {},
        limit?: number,
        page?: number,
    ): Promise<AlertDocument[]> {
        const skip = page && limit ? (page - 1) * limit : 0
        const query = this.model
            .find({
                patientId: new Types.ObjectId(patientId),
                ...filter,
            })
            .sort({ severity: -1, triggeredAt: -1 })
            .skip(skip)

        return limit ? query.limit(limit) : query
    }

    async findByPatientIds(
        patientIds: string[],
        filter: Record<string, unknown> = {},
        limit?: number,
        page?: number,
    ): Promise<AlertDocument[]> {
        const skip = page && limit ? (page - 1) * limit : 0
        const query = this.model
            .find({
                patientId: { $in: patientIds.map((id) => new Types.ObjectId(id)) },
                ...filter,
            })
            .populate({ path: 'patientId', populate: { path: 'userId', model: 'User', select: 'name' } })
            .sort({ severity: -1, triggeredAt: -1 })
            .skip(skip)

        return limit ? query.limit(limit) : query
    }

    async countByPatientId(patientId: string, filter: Record<string, unknown> = {}): Promise<number> {
        return this.model.countDocuments({
            patientId: new Types.ObjectId(patientId),
            ...filter,
        })
    }

    async countByPatientIds(patientIds: string[], filter: Record<string, unknown> = {}): Promise<number> {
        return this.model.countDocuments({
            patientId: { $in: patientIds.map((id) => new Types.ObjectId(id)) },
            ...filter,
        })
    }
}
