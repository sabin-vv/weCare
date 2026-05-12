import { model, Schema, Types } from 'mongoose'

import { AppointmentDocument } from '../types/appointment.types'

const appointmentSchema = new Schema<AppointmentDocument>(
    {
        patientId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
        },
        doctorId: {
            type: Types.ObjectId,
            ref: 'Doctor',
            required: true,
        },
        appointmentDate: {
            type: Date,
            required: true,
        },
        slotStart: {
            type: String,
            required: true,
        },
        slotEnd: {
            type: String,
            required: true,
        },
        consultationFee: {
            type: Number,
            required: true,
        },
        paymentId: {
            type: Types.ObjectId,
            ref: 'Payment',
        },
        status: {
            type: String,
            enum: ['pending_payment', 'confirmed', 'cancelled', 'missed', 'in_consultation', 'completed'],
            default: 'pending_payment',
        },
        confirmedAt: {
            type: Date,
        },
        completedAt: {
            type: Date,
        },
        missedAt: {
            type: Date,
        },
        cancelledAt: {
            type: Date,
        },
        cancelledBy: {
            type: Types.ObjectId,
            ref: 'User',
        },
        cancellationReason: {
            type: String,
        },
        expiredAt: {
            type: Date,
        },
    },
    { timestamps: true },
)

appointmentSchema.index({ doctorId: 1, appointmentDate: 1, slotStart: 1 }, { unique: true })

export const AppointmentModel = model<AppointmentDocument>('Appointment', appointmentSchema)
