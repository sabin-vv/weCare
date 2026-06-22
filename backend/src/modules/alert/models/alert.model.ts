import { model, Schema, Types } from 'mongoose'

import { AlertDocument } from '../types/alert.types'

const alertSchema = new Schema<AlertDocument>(
    {
        patientId: {
            type: Types.ObjectId,
            ref: 'Patient',
            required: true,
        },
        scheduleId: {
            type: Types.ObjectId,
        },
        type: {
            type: String,
            enum: ['missed_medication', 'critical_vital', 'critical_symptom', 'missed_vital'],
            required: true,
        },
        targetRole: {
            type: [String],
            enum: ['doctor', 'caregiver', 'patient'],
            required: true,
        },
        severity: {
            type: String,
            enum: ['medium', 'high', 'critical'],
            required: true,
        },
        triggerReason: {
            type: String,
            required: true,
        },
        triggeredAt: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['open', 'acknowledged'],
            default: 'open',
        },
        acknowledgeBy: {
            type: Types.ObjectId,
            ref: 'Doctor',
        },
        acknowledgeNote: {
            type: String,
        },
        acknowledgeAt: {
            type: Date,
        },
    },
    { timestamps: true },
)

alertSchema.index({ status: 1, severity: -1, triggeredAt: -1 })

export const alertModel = model<AlertDocument>('Alert', alertSchema)
