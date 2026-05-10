import { model, Schema, Types } from 'mongoose'

import { PrescriptionDocument } from '../types/prescription.types'

const medicationSchema = new Schema(
    {
        name: {
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
        frequency: {
            type: String,
            required: true,
            trim: true,
        },
        scheduleTimes: {
            type: [String],
            default: [],
        },
        isCritical: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false },
)

const prescriptionSchema = new Schema<PrescriptionDocument>(
    {
        patientId: {
            type: Types.ObjectId,
            ref: 'Patient',
            required: true,
        },
        prescribedBy: {
            type: Types.ObjectId,
            ref: 'Doctor',
            required: true,
        },
        medications: {
            type: [medicationSchema],
            required: true,
            validate: {
                validator: (value: unknown[]) => Array.isArray(value) && value.length > 0,
                message: 'At least one medication is required',
            },
        },
        note: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['active', 'on_hold', 'discontinued', 'amended', 'completed'],
            default: 'active',
        },
        discontinuedAt: {
            type: Date,
        },
        discontinuedBy: {
            type: Types.ObjectId,
            ref: 'Doctor',
        },
        prescribedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true },
)

prescriptionSchema.index({ patientId: 1, status: 1, prescribedAt: -1 })

export const PrescriptionModel = model<PrescriptionDocument>('Prescription', prescriptionSchema)
