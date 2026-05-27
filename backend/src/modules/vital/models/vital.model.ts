import { model, Schema, Types } from 'mongoose'

import { UserRole } from '../../auth/types/auth.types'
import { VitalDocument } from '../types/vital.types'

const vitalSchema = new Schema<VitalDocument>(
    {
        patientId: {
            type: Types.ObjectId,
            ref: 'Patient',
            required: true,
        },
        type: {
            type: String,
            enum: ['blood_sugar', 'blood_pressure', 'spo2', 'heart_rate'],
            required: true,
        },
        value: {
            type: Number,
        },
        systolic: {
            type: Number,
        },
        diastolic: {
            type: Number,
        },
        unit: {
            type: String,
            required: true,
            trim: true,
        },
        recordedAt: {
            type: Date,
            default: Date.now,
        },
        recordedBy: {
            type: Types.ObjectId,
            ref: 'User',
        },
        recordedByRole: {
            type: String,
            enum: [...Object.values(UserRole), 'system'],
            required: true,
        },
        notes: {
            type: String,
        },
    },
    { timestamps: true },
)

vitalSchema.index({ patientId: 1, type: 1, recordedAt: -1 })

export const VitalModel = model<VitalDocument>('Vital', vitalSchema)
