import https from 'https'
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

const buildSmsText = (payload: AvailabilityCancellationNotificationPayload) => {
    const refundLine = payload.refundPending ? ' Refund follow-up is pending.' : ''
    return `WeCare: Your appointment with Dr. ${payload.doctorName} on ${payload.appointmentDate} at ${payload.slotStart} was cancelled after an availability update.${refundLine} Please rebook another slot.`
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

        const smsFailure = await this.sendSms(payload)
        if (smsFailure) {
            failures.push(smsFailure)
        }

        return failures
    }

    private async sendSms(
        payload: AvailabilityCancellationNotificationPayload,
    ): Promise<AvailabilityCancellationNotificationFailure | null> {
        if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_PHONE_NUMBER) {
            logger.error(
                { appointmentId: payload.appointmentId },
                'Twilio SMS configuration missing for availability cancellation notification',
            )
            return { channel: 'sms', reason: 'Twilio SMS configuration is missing' }
        }

        if (!payload.patientMobile) {
            return { channel: 'sms', reason: 'Patient mobile number is missing' }
        }

        const body = new URLSearchParams({
            To: payload.patientMobile,
            From: env.TWILIO_PHONE_NUMBER,
            Body: buildSmsText(payload),
        }).toString()

        const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString('base64')

        return new Promise((resolve) => {
            const request = https.request(
                {
                    hostname: 'api.twilio.com',
                    path: `/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
                    method: 'POST',
                    headers: {
                        Authorization: `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': Buffer.byteLength(body),
                    },
                },
                (response) => {
                    let raw = ''
                    response.on('data', (chunk) => {
                        raw += chunk.toString()
                    })
                    response.on('end', () => {
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
                            logger.info(
                                { appointmentId: payload.appointmentId, message: buildSmsText(payload) },
                                'Cancellation SMS sent successfully',
                            )
                            resolve(null)
                            return
                        }

                        logger.error(
                            { appointmentId: payload.appointmentId, statusCode: response.statusCode, body: raw },
                            'Failed to send cancellation SMS',
                        )
                        resolve({ channel: 'sms', reason: 'Failed to send cancellation SMS' })
                    })
                },
            )

            request.on('error', (error) => {
                logger.error({ error, appointmentId: payload.appointmentId }, 'Failed to send cancellation SMS')
                resolve({ channel: 'sms', reason: 'Failed to send cancellation SMS' })
            })

            request.write(body)
            request.end()
        })
    }
}
