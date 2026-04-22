import { Document, Types } from 'mongoose'

export interface AppointmentDocument extends Document {
    patientId: Types.ObjectId
    doctorId: Types.ObjectId
    appointmentDate: Date
    slotStart: string
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    paymentStatus: 'pending' | 'paid' | 'failed'
    razorpayOrderId?: string
    razorpayPaymentId?: string
    razorpaySignature?: string
    amount: number
    createdAt: Date
    updatedAt: Date
}
