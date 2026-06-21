import { model, Schema, Types } from 'mongoose'

import {
    ACTIVITY_ACTIONS,
    ACTIVITY_CATEGORIES,
    ActivityLogDocument,
    ACTOR_ROLES,
    TARGET_TYPES,
} from '../types/activityLog.types'

const activityLogSchema = new Schema<ActivityLogDocument>(
    {
        performedBy: {
            type: Types.ObjectId,
            ref: 'User',
        },
        performedByRole: {
            type: String,
            enum: ACTOR_ROLES,
            required: true,
        },
        category: {
            type: String,
            enum: ACTIVITY_CATEGORIES,
            required: true,
        },
        action: {
            type: String,
            enum: ACTIVITY_ACTIONS,
            required: true,
        },
        patientId: {
            type: Types.ObjectId,
            ref: 'Patient',
        },
        targetId: {
            type: Types.ObjectId,
        },
        targetType: {
            type: String,
            enum: TARGET_TYPES,
        },
        referenceId: {
            type: Types.ObjectId,
        },
        description: {
            type: String,
            required: true,
        },
    },
    { timestamps: true },
)

activityLogSchema.index({ createdAt: -1 })
activityLogSchema.index({ category: 1, createdAt: -1 })

export const ActivityLogModel = model<ActivityLogDocument>('ActivityLog', activityLogSchema)
