import { model, Schema, Types } from 'mongoose'

import { MedicationLogDocument } from '../types/medicationLog.types'

const medicationLogSchema = new Schema<MedicationLogDocument>(
    {
        patientId: { type: Types.ObjectId, ref: 'Patient', required: true },
        caregiverId: { type: Types.ObjectId, ref: 'User', required: true },
        medicationId: { type: Types.ObjectId, ref: 'Medication', required: true },
        status: {
            type: String,
            enum: ['on_time', 'taken_late', 'skipped'],
            required: true,
        },
        takenTime: { type: Date, required: true },
        route: { type: String, required: true },
        observations: { type: String, default: '' },
    },
    { timestamps: true },
)

medicationLogSchema.index({ patientId: 1, medicationId: 1, takenTime: -1 })

export const MedicationLogModel = model<MedicationLogDocument>('MedicationLog', medicationLogSchema)