import { model, Schema, Types } from 'mongoose'

import { PatientDocument } from '../types/patient.types'

const patientSchema = new Schema<PatientDocument>(
    {
        userId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
        },
        patientId: {
            type: String,
            required: true,
            unique: true,
        },
        dateOfBirth: {
            type: Date,
            required: true,
        },
        gender: {
            type: String,
            required: true,
        },
        profileImage: {
            type: String,
        },
        conditions: {
            type: [String],
            default: [],
        },
        riskLevel: {
            type: String,
            enum: ['mild', 'moderate', 'severe', 'high_risk'],
        },
        accountStatus: {
            type: String,
            enum: ['suspended', 'active', 'archived'],
        },
        clinicalStatus: {
            type: String,
            enum: ['active', 'hospitalized', 'deceased'],
            default: 'active',
        },
        primaryDoctorId: {
            type: Types.ObjectId,
            ref: 'Doctor',
        },
        caregiverId: {
            type: Types.ObjectId,
            ref: 'Caregiver',
        },
    },
    { timestamps: true },
)

export const PatientModel = model<PatientDocument>('Patient', patientSchema)
