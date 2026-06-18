import { model, Schema, Types } from 'mongoose'

import { MedicalRecordDocument } from '../types/medicalRecord.types'

const clinicalNoteSchema = new Schema(
    {
        note: { type: String, required: true },
        doctorName: { type: String, required: true },
    },
    { timestamps: true },
)

const medicalRecordSchema = new Schema<MedicalRecordDocument>(
    {
        patientId: {
            type: Types.ObjectId,
            ref: 'Patient',
            required: true,
            unique: true,
        },
        allergies: {
            type: [String],
            default: [],
        },
        pastSurgeries: {
            type: String,
            default: '',
        },
        clinicalNotes: {
            type: [clinicalNoteSchema],
            default: [],
        },
    },
    { timestamps: true },
)

export const MedicalRecordModel = model<MedicalRecordDocument>('MedicalRecord', medicalRecordSchema)
