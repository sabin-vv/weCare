import { model, Schema, Types } from 'mongoose'

import { VitalLogDocument } from '../types/vitalLog.types'

const vitalLogSchema = new Schema<VitalLogDocument>(
    {
        patientId: { type: Types.ObjectId, ref: 'Patient', required: true },
        caregiverId: { type: Types.ObjectId, ref: 'User', required: true },
        vitalType: { type: String, required: true },
        value: { type: Number, required: true },
        systolic: { type: Number, required: false },
        diastolic: { type: Number, required: false },
        recordedAt: { type: Date, required: true },
        notes: { type: String, default: '' },
    },
    { timestamps: true },
)

vitalLogSchema.index({ patientId: 1, vitalType: 1, recordedAt: -1 })

export const VitalLogModel = model<VitalLogDocument>('VitalLog', vitalLogSchema)
