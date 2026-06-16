import { model, Schema, Types } from 'mongoose'

import { CaregiverActivityLogDocument } from '../types/caregiverActivity.types'

const caregiverActivityLogSchema = new Schema<CaregiverActivityLogDocument>(
    {
        caregiverId: {
            type: Types.ObjectId,
            ref: 'Caregiver',
            required: true,
        },
        patientId: {
            type: Types.ObjectId,
            ref: 'Patient',
            required: true,
        },
        activityType: {
            type: String,
            enum: ['medication_administered', 'medication_missed', 'vital_recorded', 'vital_missed', 'symptom_logged'],
            required: true,
        },
        referenceId: {
            type: Types.ObjectId,
        },
        description: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true },
)

caregiverActivityLogSchema.index({ caregiverId: 1, createdAt: -1 })
caregiverActivityLogSchema.index({ patientId: 1, createdAt: -1 })

export const CaregiverActivityLogModel = model<CaregiverActivityLogDocument>(
    'CaregiverActivityLog',
    caregiverActivityLogSchema,
)
