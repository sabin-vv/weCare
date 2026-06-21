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
    appointmentId: string
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
    rescheduledAt?: Date
    createdAt: Date
    updatedAt: Date
}

export interface DoctorAppointmentRowDTO {
    appointmentId: string
    patientId: string
    name: string
    email: string
    profileImage?: string
    appointmentDate: string
    slotStart: string
    slotEnd: string
    status: 'confirmed' | 'completed'
}

export interface DoctorAppointmentsPaginationDTO {
    page: number
    limit: number
    totalCount: number
    totalPages: number
}

export interface DoctorAppointmentsResponseDTO {
    appointments: DoctorAppointmentRowDTO[]
    pagination: DoctorAppointmentsPaginationDTO
}

export interface PopulatedUser {
    _id: string | Types.ObjectId
    name: string
    email: string
    profileImage?: string
}

export interface AppointmentResponseDTO {
    _id: string
    doctorId: string | Types.ObjectId | PopulatedUser
    patientId: string | Types.ObjectId | PopulatedUser
    appointmentId: string
    appointmentDate: string
    slotStart: string
    slotEnd: string
    status: string
    paymentStatus: string
    amount: number
    createdAt: string
}

export interface PopulatedPayment {
    status?: 'pending' | 'success' | 'failed' | 'refund_pending' | 'refunded'
    totalAmount?: number
}

export type MongooseLikeDocument<T> = T & {
    _doc?: T
    toObject?: () => T
}
