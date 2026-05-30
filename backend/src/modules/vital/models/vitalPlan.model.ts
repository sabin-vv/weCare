import { model, Schema, Types } from 'mongoose'

import { VitalPlanDocument } from '../types/vital.types'

const vitalPlanItemSchema = new Schema(
    {
        type: {
            type: String,
            enum: ['blood_sugar', 'blood_pressure', 'spo2', 'heart_rate'],
            required: true,
        },
        frequencyValue: {
            type: Number,
            required: true,
            min: 1,
        },
        frequencyUnit: {
            type: String,
            enum: ['hours', 'days', 'weeks'],
            required: true,
        },
        durationValue: {
            type: Number,
            required: true,
            min: 1,
        },
        durationUnit: {
            type: String,
            enum: ['hours', 'days', 'weeks', 'months'],
            required: true,
        },
    },
    { _id: false },
)

const vitalPlanSchema = new Schema<VitalPlanDocument>(
    {
        patientId: {
            type: Types.ObjectId,
            ref: 'Patient',
            required: true,
        },
        requestedBy: {
            type: Types.ObjectId,
            ref: 'Doctor',
            required: true,
        },
        vitals: {
            type: [vitalPlanItemSchema],
            required: true,
            validate: {
                validator: (value: unknown[]) => Array.isArray(value) && value.length > 0,
                message: 'At least one vital plan item is required',
            },
        },
        instructions: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'cancelled', 'paused'],
            default: 'active',
        },
        statusReason: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true },
)

vitalPlanSchema.index({ patientId: 1, status: 1, createdAt: -1 })

export const vitalPlanModel = model<VitalPlanDocument>('VitalPlan', vitalPlanSchema)
