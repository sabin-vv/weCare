import { Types } from 'mongoose'

import { AppointmentDocument } from '../types/appointment.types'

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
    appointmentDate: string
    slotStart: string
    slotEnd: string
    status: string
    paymentStatus: string
    amount: number
    createdAt: string
}

interface PopulatedPayment {
    status?: 'pending' | 'success' | 'failed' | 'refund_pending' | 'refunded'
    totalAmount?: number
}

type MongooseLikeDocument<T> = T & {
    _doc?: T
    toObject?: () => T
}

const isPopulatedPayment = (value: unknown): value is PopulatedPayment => {
    return typeof value === 'object' && value !== null
}

const hasToObject = <T extends object>(value: T | MongooseLikeDocument<T>): value is MongooseLikeDocument<T> => {
    return 'toObject' in value && typeof value.toObject === 'function'
}

const hasDoc = <T extends object>(value: T | MongooseLikeDocument<T>): value is MongooseLikeDocument<T> => {
    return '_doc' in value && typeof value._doc === 'object' && value._doc !== null
}

const normalizePopulatedUser = (
    value: string | Types.ObjectId | PopulatedUser | MongooseLikeDocument<PopulatedUser>,
): string | Types.ObjectId | PopulatedUser => {
    if (typeof value === 'string' || value instanceof Types.ObjectId) {
        return value
    }

    if (hasToObject(value)) {
        return value.toObject?.() ?? value
    }

    if (hasDoc(value)) {
        return value._doc ?? value
    }

    return value
}

const mapPaymentStatus = (status?: PopulatedPayment['status']) => {
    switch (status) {
        case 'success':
            return 'paid'
        case 'failed':
            return 'failed'
        case 'refunded':
            return 'refunded'
        case 'refund_pending':
            return 'refund_pending'
        case 'pending':
            return 'pending'
        default:
            return 'pending'
    }
}

export const toAppointmentResponseDTO = (appointment: AppointmentDocument): AppointmentResponseDTO => {
    const payment = isPopulatedPayment(appointment.paymentId) ? appointment.paymentId : undefined

    return {
        _id: appointment._id.toString(),
        doctorId: normalizePopulatedUser(appointment.doctorId),
        patientId: normalizePopulatedUser(appointment.patientId),
        appointmentDate: appointment.appointmentDate.toISOString(),
        slotStart: appointment.slotStart,
        slotEnd: appointment.slotEnd,
        status: appointment.status,
        paymentStatus: payment
            ? mapPaymentStatus(payment.status)
            : appointment.status === 'pending_payment'
              ? 'pending'
              : 'paid',
        amount: payment?.totalAmount ?? appointment.consultationFee,
        createdAt: appointment.createdAt.toISOString(),
    }
}

export const toAppointmentListResponseDTO = (appointments: AppointmentDocument[]): AppointmentResponseDTO[] => {
    return appointments.map(toAppointmentResponseDTO)
}
