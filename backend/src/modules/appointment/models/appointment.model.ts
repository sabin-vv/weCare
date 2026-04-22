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
            ref: 'User',
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
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled', 'completed'],
            default: 'pending',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending',
        },
        razorpayOrderId: {
            type: String,
        },
        razorpayPaymentId: {
            type: String,
        },
        razorpaySignature: {
            type: String,
        },
        amount: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true },
)

export const AppointmentModel = model<AppointmentDocument>('Appointment', appointmentSchema)
