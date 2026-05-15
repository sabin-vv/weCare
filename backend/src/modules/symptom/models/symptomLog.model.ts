import { model, Schema, Types } from 'mongoose'

import { SymptomLogDocument } from '../types/symptomLog.types'

const symptomLogSchema = new Schema<SymptomLogDocument>(
    {
        patientId: { type: Types.ObjectId, ref: 'Patient', required: true },
        caregiverId: { type: Types.ObjectId, ref: 'User', required: true },
        symptom: { type: String, required: true },
        onsetTime: { type: Date, required: true },
        severity: {
            type: String,
            enum: ['mild', 'moderate', 'severe', 'critical'],
            required: true,
        },
        observations: { type: String, default: '' },
    },
    { timestamps: true },
)

symptomLogSchema.index({ patientId: 1, symptom: 1, onsetTime: -1 })

export const SymptomLogModel = model<SymptomLogDocument>('SymptomLog', symptomLogSchema)