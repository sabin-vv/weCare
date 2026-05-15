import { model, Schema, Types } from 'mongoose'

import { MedicationScheduleModel } from '../types/medication.type'

const systemGeneratedScheduleSchema = new Schema<MedicationScheduleModel>(
    {
        prescriptionId: {
            type: Types.ObjectId,
            ref: 'Prescription',
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
            required: true,
        },
        medicineName: {
            type: String,
            required: true,
            trim: true,
        },
        dosage: {
            type: String,
            required: true,
            trim: true,
        },
        route: {
            type: String,
            enum: ['oral', 'injection', 'IV', 'inhalation'],
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
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'administered', 'missed', 'skipped', 'cancelled'],
            default: 'pending',
        },
        cancelledReason: {
            type: String,
        },
        skippedReason: {
            type: String,
        },
        missedReason: {
            type: String,
        },
        missedAt: {
            type: Date,
        },
        administeredAt: {
            type: Date,
        },
        administeredBy: {
            type: Types.ObjectId,
            ref: 'User',
        },
        administrationNotes: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true },
)

systemGeneratedScheduleSchema.index({ patientId: 1, status: 1, scheduleTime: 1 })
systemGeneratedScheduleSchema.index({ caregiverId: 1, scheduleTime: 1 })

export const SystemGeneratedScheduleModel = model<MedicationScheduleModel>(
    'SystemGeneratedSchedule',
    systemGeneratedScheduleSchema,
)
