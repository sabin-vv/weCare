export interface AvailabilityCancellationNotificationPayload {
    appointmentId: string
    patientName: string
    patientEmail: string
    doctorName: string
    appointmentDate: string
    slotStart: string
    slotEnd: string
    refundPending: boolean
}

export interface AvailabilityCancellationNotificationFailure {
    channel: 'email'
    reason: string
}

export interface IAvailabilityNotificationService {
    sendAvailabilityCancellation(
        payload: AvailabilityCancellationNotificationPayload,
    ): Promise<AvailabilityCancellationNotificationFailure[]>
}
