import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'
import { IFeedbackRepository } from '../interfaces/feedback.repository.interface'
import { IFeedbackService } from '../interfaces/feedback.service.interface'
import { CreateFeedbackDTO, FeedbackDocument, FeedbackResponse } from '../types/feedback.types'

const toFeedbackResponse = (doc: FeedbackDocument): FeedbackResponse => ({
    id: doc._id.toString(),
    patientId: doc.patientId.toString(),
    targetId: doc.targetId.toString(),
    targetRole: doc.targetRole,
    rating: doc.rating,
    comment: doc.comment,
    createdAt: doc.createdAt.toISOString(),
})

@injectable()
export class FeedbackService implements IFeedbackService {
    constructor(
        @inject(TOKENS.IFeedbackRepository) private _feedbackRepo: IFeedbackRepository,
        @inject(TOKENS.IPatientRepository) private _patientRepo: IPatientRepository,
    ) {}

    async submitFeedback(userId: string, dto: CreateFeedbackDTO): Promise<FeedbackResponse> {
        const patient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient profile not found')
        }

        const existing = await this._feedbackRepo.findOneByPatientAndTarget(
            patient._id.toString(),
            dto.targetId.toString(),
            dto.targetRole,
        )

        if (existing) {
            const updated = await this._feedbackRepo.update(existing._id.toString(), {
                rating: dto.rating,
                comment: dto.comment,
            })
            if (!updated) {
                throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update feedback')
            }
            return toFeedbackResponse(updated)
        }

        const feedback = await this._feedbackRepo.create({
            patientId: patient._id,
            targetId: new Types.ObjectId(dto.targetId),
            targetRole: dto.targetRole,
            rating: dto.rating,
            comment: dto.comment,
        })

        return toFeedbackResponse(feedback)
    }
}
