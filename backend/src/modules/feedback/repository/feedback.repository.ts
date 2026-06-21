import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IFeedbackRepository } from '../interfaces/feedback.repository.interface'
import { FeedbackModel } from '../models/feedback.model'
import { FeedbackDocument } from '../types/feedback.types'

@injectable()
export class FeedbackRepository extends BaseRepository<FeedbackDocument> implements IFeedbackRepository {
    constructor() {
        super(FeedbackModel)
    }

    async findOneByPatientAndTarget(
        patientId: string,
        targetId: string,
        targetRole: string,
    ): Promise<FeedbackDocument | null> {
        return this.model.findOne({
            patientId: new Types.ObjectId(patientId),
            targetId: new Types.ObjectId(targetId),
            targetRole,
        })
    }

    async findFeedbackByPatient(patientId: string): Promise<FeedbackDocument[]> {
        return this.model.find({ patientId: new Types.ObjectId(patientId) }).sort({ createdAt: -1 })
    }

    async getAverageRatingByDoctors(): Promise<
        Array<{ doctorId: string; averageRating: number; reviewCount: number }>
    > {
        const result = await this.model.aggregate([
            {
                $match: { targetRole: 'doctor' },
            },
            {
                $group: {
                    _id: '$targetId',
                    averageRating: { $avg: '$rating' },
                    reviewCount: { $sum: 1 },
                },
            },
        ])

        return result.map((r) => ({
            doctorId: r._id.toString(),
            averageRating: Math.round(r.averageRating * 10) / 10,
            reviewCount: r.reviewCount,
        }))
    }
}
