import { Document, Types } from 'mongoose'

interface AppointmentPaymentInfo {
    _id?: string | Types.ObjectId
    status?: 'pending' | 'success' | 'failed' | 'refund_pending' | 'refunded'
    totalAmount?: number
}

export interface PopulatedAppointmentUser {
    _id: string | Types.ObjectId
    name: string
    email: string
    mobile: string
}

export interface PopulatedAppointmentPayment extends AppointmentPaymentInfo {
    _id: string | Types.ObjectId
    status?: 'pending' | 'success' | 'failed' | 'refund_pending' | 'refunded'
}

export interface AppointmentDocument extends Document {
    patientId: Types.ObjectId | PopulatedAppointmentUser
    doctorId: Types.ObjectId
    appointmentDate: Date
    slotStart: string
    slotEnd: string
    consultationFee: number
    paymentId?: Types.ObjectId | PopulatedAppointmentPayment
    status: 'pending_payment' | 'confirmed' | 'cancelled' | 'missed' | 'in_consultation' | 'completed'
    confirmedAt?: Date
    completedAt?: Date
    missedAt?: Date
    cancelledAt?: Date
    cancelledBy?: Types.ObjectId
    cancellationReason?: string
    expiredAt?: Date
    createdAt: Date
    updatedAt: Date
}
