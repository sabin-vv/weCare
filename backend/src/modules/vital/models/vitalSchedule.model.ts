import { model, Schema, Types } from 'mongoose'

import { VitalScheduleDocument } from '../types/vital.types'

const vitalScheduleSchema = new Schema<VitalScheduleDocument>(
    {
        vitalPlanId: {
            type: Types.ObjectId,
            ref: 'VitalPlan',
            required: true,
        },
        patientId: {
            type: Types.ObjectId,
            ref: 'Patient',
            required: true,
        },
        caregiverId: {
            type: Types.ObjectId,
            ref: 'Caregiver',
        },
        vitalType: {
            type: String,
            enum: ['blood_pressure', 'blood_sugar', 'heart_rate', 'temperature', 'oxygen_saturation'],
            required: true,
        },
        scheduleDate: {
            type: Date,
            required: true,
        },
        scheduleTime: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium',
        },
        status: {
            type: String,
            enum: ['pending', 'recorded', 'missed', 'skipped', 'cancelled'],
            default: 'pending',
        },
        recordedValue: {
            systolic: Number,
            diastolic: Number,
            value: Number,
            unit: String,
        },
        recordedAt: {
            type: Date,
        },
        recordedBy: {
            type: Types.ObjectId,
            ref: 'User',
        },
        recordedNotes: {
            type: String,
            trim: true,
        },
        missedReason: {
            type: String,
        },
        missedAt: {
            type: Date,
        },
    },
    { timestamps: true },
)

vitalScheduleSchema.index({ patientId: 1, status: 1, scheduleTime: 1 })
vitalScheduleSchema.index({ caregiverId: 1, scheduleTime: 1 })

export const vitalScheduleModel = model<VitalScheduleDocument>('VitalSchedule', vitalScheduleSchema)
