import {
    AppointmentDocument,
    PopulatedAppointmentPayment,
    PopulatedAppointmentUser,
} from '../../appointment/types/appointment.types'
import {
    AvailabilityCancellationNotificationFailure,
    AvailabilityCancellationNotificationPayload,
} from '../interfaces/availabilityNotification.service.interface'
import { NotificationFailure } from '../types/doctor.types'

const isPopulatedPatient = (value: AppointmentDocument['patientId']): value is PopulatedAppointmentUser => {
    return typeof value === 'object' && value !== null && 'email' in value && 'mobile' in value && 'name' in value
}

const isPopulatedPayment = (value: AppointmentDocument['paymentId']): value is PopulatedAppointmentPayment => {
    return typeof value === 'object' && value !== null && 'status' in value
}

const toDateLabel = (appointmentDate: Date) => {
    return appointmentDate.toISOString().split('T')[0]
}

export const toAvailabilityCancellationNotificationPayload = (
    appointment: AppointmentDocument,
    doctorName: string,
): AvailabilityCancellationNotificationPayload | null => {
    if (!isPopulatedPatient(appointment.patientId)) {
        return null
    }

    const payment = isPopulatedPayment(appointment.paymentId) ? appointment.paymentId : undefined

    return {
        appointmentId: appointment._id.toString(),
        patientName: appointment.patientId.name,
        patientEmail: appointment.patientId.email,
        doctorName,
        appointmentDate: toDateLabel(appointment.appointmentDate),
        slotStart: appointment.slotStart,
        slotEnd: appointment.slotEnd,
        refundPending: payment?.status === 'refund_pending',
    }
}

export const toNotificationFailures = (
    appointmentId: string,
    failures: AvailabilityCancellationNotificationFailure[],
): NotificationFailure[] => {
    return failures.map((failure) => ({
        appointmentId,
        channel: failure.channel,
        reason: failure.reason,
    }))
}
