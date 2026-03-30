import { model, Schema, Types } from 'mongoose'

import { PatientDocument } from '../types/patient.types'

const patientSchema = new Schema<PatientDocument>(
    {
        userId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
        },
        dateOfBirth: {
            type: Date,
            required: true,
        },
        gender: {
            type: String,
            required: true,
        },
        mobile: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            required: true,
            default: true,
        },
        profileImage: {
            type: String,
        },
    },
    { timestamps: true },
)

export const PatientModel = model<PatientDocument>('Patient', patientSchema)

