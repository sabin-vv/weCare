import { PipelineStage, Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { ICaregiverRepository } from '../interfaces/caregiver.repository.interface'
import { CaregiverModel } from '../models/caregiver.model'
import { CaregiverDocument, CaregiverWithUser } from '../types/caregiver.types'

@injectable()
export class CaregiverRepository extends BaseRepository<CaregiverDocument> implements ICaregiverRepository {
    constructor() {
        super(CaregiverModel)
    }

    async findByUserId(userId: Types.ObjectId): Promise<CaregiverDocument | null> {
        return this.model.findOne({ userId })
    }

    async findById(id: string): Promise<CaregiverDocument | null> {
        if (!Types.ObjectId.isValid(id)) return null
        return this.model.findById(id).lean()
    }

    async findAllActive(search?: string): Promise<CaregiverWithUser[]> {
        const pipeline: PipelineStage[] = [
            {
                $match: {
                    isActive: true,
                    verificationStatus: 'verified',
                },
            },

            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },

            {
                $unwind: '$user',
            },
        ]

        if (search?.trim()) {
            pipeline.push({
                $match: {
                    'user.name': {
                        $regex: search,
                        $options: 'i',
                    },
                },
            })
        }

        return this.model.aggregate<CaregiverWithUser>(pipeline)
    }

    async updateByUserId(userId: Types.ObjectId, data: Partial<CaregiverDocument>): Promise<CaregiverDocument | null> {
        return this.model.findOneAndUpdate({ userId }, data, { returnDocument: 'after' })
    }
}
