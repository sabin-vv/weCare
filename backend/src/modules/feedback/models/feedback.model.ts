import { model, Schema } from 'mongoose'

import { FeedbackDocument } from '../types/feedback.types'

const feedbackSchema = new Schema<FeedbackDocument>(
    {
        patientId: {
            type: Schema.Types.ObjectId,
            ref: 'Patient',
            required: true,
        },
        targetId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        targetRole: {
            type: String,
            enum: ['doctor', 'caregiver'],
            required: true,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },
        comment: {
            type: String,
            maxlength: 500,
        },
    },
    { timestamps: true },
)

feedbackSchema.index({ targetId: 1, targetRole: 1 })
feedbackSchema.index({ patientId: 1 })

export const FeedbackModel = model<FeedbackDocument>('Feedback', feedbackSchema)
