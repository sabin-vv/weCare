import { model, Schema, Types } from 'mongoose'

import { ReminderDocument } from '../types/reminder.types'

const reminderSchema = new Schema<ReminderDocument>(
    {
        caregiverId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
        },
        patientId: {
            type: Types.ObjectId,
            ref: 'Patient',
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        scheduleTime: {
            type: Date,
            required: true,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        status: {
            type: String,
            enum: ['pending', 'completed'],
            default: 'pending',
        },
    },
    { timestamps: true },
)

reminderSchema.index({ caregiverId: 1, status: 1, scheduleTime: -1 })

export const ReminderModel = model<ReminderDocument>('Reminder', reminderSchema)
