import { Types } from 'mongoose'

import { PatientDocument } from '../../patient/types/patient.types'
import {
    AppointmentDocument,
    AppointmentResponseDTO,
    DoctorAppointmentRowDTO,
    MongooseLikeDocument,
    PopulatedPayment,
    PopulatedUser,
} from '../types/appointment.types'

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

const getPopulatedUserName = (
    value?: string | Types.ObjectId | PopulatedUser | MongooseLikeDocument<PopulatedUser>,
): string | undefined => {
    if (!value || typeof value === 'string' || value instanceof Types.ObjectId) {
        return undefined
    }

    const user = normalizePopulatedUser(value)
    if (typeof user === 'string' || user instanceof Types.ObjectId) {
        return undefined
    }

    return user.name
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
        appointmentId: appointment.appointmentId,
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
        consultationFee: payment?.consultationFee ?? appointment.consultationFee,
        platformFee: payment?.platformFee,
        confirmedAt: appointment.confirmedAt?.toISOString(),
        cancelledAt: appointment.cancelledAt?.toISOString(),
        completedAt: appointment.completedAt?.toISOString(),
        paidAt: payment?.paidAt ? new Date(payment.paidAt).toISOString() : undefined,
        createdAt: appointment.createdAt.toISOString(),
        cancelledBy: getPopulatedUserName(appointment.cancelledBy),
        cancellationReason: appointment?.cancellationReason,
    }
}

export const toAppointmentListResponseDTO = (appointments: AppointmentDocument[]): AppointmentResponseDTO[] => {
    return appointments.map(toAppointmentResponseDTO)
}

export const toDoctorAppointmentRowDTO = (
    appointment: AppointmentDocument,
    patient: PatientDocument,
    patientDisplay: {
        name: string
        email: string
    },
): DoctorAppointmentRowDTO => {
    return {
        appointmentId: appointment._id.toString(),
        patientId: patient._id.toString(),
        name: patientDisplay.name,
        email: patientDisplay.email,
        profileImage: patient.profileImage,
        appointmentDate: appointment.appointmentDate.toISOString(),
        slotStart: appointment.slotStart,
        slotEnd: appointment.slotEnd,
        status: appointment.status as 'confirmed' | 'completed',
    }
}
