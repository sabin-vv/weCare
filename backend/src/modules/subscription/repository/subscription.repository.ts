import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { ISubscriptionRepository } from '../interfaces/subscription.repository.interface'
import { SubscriptionModel } from '../models/subscription.model'
import type { SubscriptionDocument } from '../types/subscription.types'

@injectable()
export class SubscriptionRepository implements ISubscriptionRepository {
    async findById(id: string): Promise<SubscriptionDocument | null> {
        return await SubscriptionModel.findById(id).lean()
    }

    async findByPatientId(patientId: Types.ObjectId): Promise<SubscriptionDocument | null> {
        return await SubscriptionModel.findOne({ patientId }).lean()
    }

    async findActiveByPatient(patientId: Types.ObjectId): Promise<SubscriptionDocument | null> {
        return await SubscriptionModel.findOne({
            patientId,
            status: 'active',
        }).lean()
    }

    async create(data: Partial<SubscriptionDocument>): Promise<SubscriptionDocument> {
        return await SubscriptionModel.create(data)
    }

    async updateById(id: string, data: Partial<SubscriptionDocument>): Promise<SubscriptionDocument | null> {
        return await SubscriptionModel.findByIdAndUpdate(id, data, { returnDocument: 'after' })
    }
}
