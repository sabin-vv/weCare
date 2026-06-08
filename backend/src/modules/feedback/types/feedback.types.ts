import { Document, Types } from 'mongoose'

export type FeedbackTargetRole = 'doctor' | 'caregiver'

export interface FeedbackDocument extends Document {
    patientId: Types.ObjectId
    targetId: Types.ObjectId
    targetRole: FeedbackTargetRole
    rating: number
    comment?: string
    createdAt: Date
    updatedAt: Date
}

export interface CreateFeedbackDTO {
    patientId: Types.ObjectId
    targetId: Types.ObjectId
    targetRole: FeedbackTargetRole
    rating: number
    comment?: string
}

export interface FeedbackResponse {
    id: string
    patientId: string
    targetId: string
    targetRole: FeedbackTargetRole
    rating: number
    comment?: string
    createdAt: string
}
