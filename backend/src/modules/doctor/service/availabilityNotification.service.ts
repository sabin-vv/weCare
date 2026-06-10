import { injectable } from 'tsyringe'

import { env } from '../../../core/config/env'
import { transporter } from '../../../core/config/mailer'
import { logger } from '../../../core/logger/logger'
import {
    AvailabilityCancellationNotificationFailure,
    AvailabilityCancellationNotificationPayload,
    IAvailabilityNotificationService,
} from '../interfaces/availabilityNotification.service.interface'

const buildEmailText = (payload: AvailabilityCancellationNotificationPayload) => {
    const refundLine = payload.refundPending
        ? 'Your payment has been marked for refund follow-up.'
        : 'No completed payment was found for this booking.'

    return [
        `Hello ${payload.patientName},`,
        '',
        `Your appointment with Dr. ${payload.doctorName} on ${payload.appointmentDate} from ${payload.slotStart} to ${payload.slotEnd} has been cancelled because the doctor updated their availability.`,
        refundLine,
        'Please log in and book another available slot.',
        '',
        'Regards,',
        'WeCare',
    ].join('\n')
}

@injectable()
export class AvailabilityNotificationService implements IAvailabilityNotificationService {
    async sendAvailabilityCancellation(
        payload: AvailabilityCancellationNotificationPayload,
    ): Promise<AvailabilityCancellationNotificationFailure[]> {
        const failures: AvailabilityCancellationNotificationFailure[] = []

        try {
            await transporter.sendMail({
                from: env.EMAIL_USER,
                to: payload.patientEmail,
                subject: 'WeCare appointment cancelled due to availability change',
                text: buildEmailText(payload),
            })
        } catch (error) {
            logger.error({ error, appointmentId: payload.appointmentId }, 'Failed to send cancellation email')
            failures.push({ channel: 'email', reason: 'Failed to send cancellation email' })
        }

        return failures
    }
}
