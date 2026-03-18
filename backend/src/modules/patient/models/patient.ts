import { model, Schema } from 'mongoose'

import { AccountStatus, ClinicalStatus, Patient, RiskLevel } from '../interfaces/patientInterfaces'

const patientSchema = new Schema<Patient>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        patientId: {
            type: String,
            unique: true,
        },
        dateOfBirth: {
            type: Date,
            required: true,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            required: true,
        },
        conditions: {
            type: [String],
            default: [],
        },
        riskLevel: {
            type: String,
            enum: Object.values(RiskLevel),
        },
        accountStatus: {
            type: String,
            enum: Object.values(AccountStatus),
        },
        clinicalStatus: {
            type: String,
            enum: Object.values(ClinicalStatus),
            default: ClinicalStatus.ACTIVE,
        },
        primaryDoctorId: {
            type: Schema.Types.ObjectId,
            ref: 'Doctor',
        },
        caregiverId: {
            type: Schema.Types.ObjectId,
            ref: 'Caregiver',
        },
        profileImage: {
            type: String,
        },
    },
    { timestamps: true },
)

const Patient = model('Patient', patientSchema)
export default Patient
