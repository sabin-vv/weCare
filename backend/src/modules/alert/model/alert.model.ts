import { model, Schema, Types } from 'mongoose'

import type { AlertDocument } from '../types/alert.types'

const alertSchema = new Schema<AlertDocument>(
    {
        patientId: {
            type: Types.ObjectId,
            ref: 'Patient',
            required: true,
        },
        caregiverId: {
            type: Types.ObjectId,
            ref: 'Caregiver',
            required: true,
        },
        doctorId: {
            type: Types.ObjectId,
            ref: 'Doctor',
        },
        scheduleId: {
            type: Types.ObjectId,
        },
        type: {
            type: String,
            enum: ['missed_medication', 'critical_vital', 'critical_symptom', 'missed_vital'],
            required: true,
        },
        severity: {
            type: String,
            enum: ['high', 'critical'],
            required: true,
        },
        triggerReason: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['open', 'acknowledged', 'resolved'],
            default: 'open',
        },
        acknowledgeBy: {
            type: Types.ObjectId,
            ref: 'User',
        },
        acknowledgeAt: {
            type: Date,
        },
        acknowledgeNote: {
            type: String,
        },
        resolvedAt: {
            type: Date,
        },
        resolvedBy: {
            type: Types.ObjectId,
            ref: 'User',
        },
        notificationSent: {
            type: Boolean,
            default: false,
        },
        triggeredAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true },
)

alertSchema.index({ patientId: 1, status: 1 })
alertSchema.index({ type: 1, severity: 1 })
alertSchema.index({ triggeredAt: -1 })

export const AlertModel = model<AlertDocument>('Alert', alertSchema)