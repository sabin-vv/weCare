import crypto from 'crypto'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { env } from '../../../core/config/env'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IActivityLogService } from '../../activityLog/interfaces/activityLog.service.interface'
import { IAppointmentRepository } from '../../appointment/interfaces/appointment.repository.interface'
import { IDoctorRepository } from '../../doctor/interfaces/doctor.repository.interface'
import { INotificationService } from '../../notification/interfaces/notification.service.interface'
import { CreateNotificationPayload } from '../../notification/types/notification.types'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'
import { MSG } from '../constants/messages'
import { IPaymentRepository } from '../interfaces/payment.repository.interface'
import { IPaymentService } from '../interfaces/payment.service.interface'
import { PaymentDocument } from '../types/payment.types'
import { VerifyPaymentDTO } from '../validator/payment.schema'

@injectable()
export class PaymentService implements IPaymentService {
    constructor(
        @inject(TOKENS.IAppointmentRepository) private _appointmentRepo: IAppointmentRepository,
        @inject(TOKENS.IPaymentRepository) private _paymentRepo: IPaymentRepository,
        @inject(TOKENS.IPatientRepository) private _patientRepo: IPatientRepository,
        @inject(TOKENS.IDoctorRepository) private _doctorRepo: IDoctorRepository,
        @inject(TOKENS.INotificationService) private _notificationService: INotificationService,
        @inject(TOKENS.IActivityLogService) private _activityLogService: IActivityLogService,
    ) {}
    async verifyPayment(dto: VerifyPaymentDTO): Promise<PaymentDocument> {
        const secret = env.RAZORPAY_KEY_SECRET
        const body = dto.razorpayOrderId + '|' + dto.razorpayPaymentId

        const expectedSignature = crypto.createHmac('sha256', secret).update(body.toString()).digest('hex')

        if (expectedSignature !== dto.razorpaySignature) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.INVALID_SIGNATURE)
        }

        const payment = await this._paymentRepo.findByOrderId(dto.razorpayOrderId)
        if (!payment) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.NOT_FOUND)
        }

        if (payment.status === 'success') {
            return payment
        }

        const updatedPayment = await this._paymentRepo.updateById(payment._id.toString(), {
            status: 'success',
            razorpayPaymentId: dto.razorpayPaymentId,
            razorpaySignature: dto.razorpaySignature,
            paidAt: new Date(),
        })
        if (payment.appointmentId) {
            await this._appointmentRepo.update(payment.appointmentId.toString(), {
                status: 'confirmed',
                confirmedAt: new Date(),
            })

            const appointment = await this._appointmentRepo.findById(payment.appointmentId.toString())
            if (appointment) {
                await this._patientRepo.updateByUserId(payment.patientId, { primaryDoctorId: appointment.doctorId })

                const doctor = await this._doctorRepo
                    .findByIdWithUser(appointment.doctorId.toString())
                    .catch(() => null)
                const doctorName = (doctor?.userId as unknown as { name?: string })?.name ?? 'Doctor'

                const paymentConfirmedPayload: CreateNotificationPayload = {
                    recipientId: payment.patientId.toString(),
                    recipientRole: 'patient',
                    type: 'appointment_confirmed',
                    title: 'Appointment Confirmed',
                    message: `Your appointment with Dr. ${doctorName} on ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.slotStart} has been confirmed.`,
                    metadata: { appointmentId: appointment._id.toString() },
                }
                await this._notificationService.createNotification(paymentConfirmedPayload).catch(() => null)

                if (doctor) {
                    const doctorPayload: CreateNotificationPayload = {
                        recipientId: (doctor.userId as unknown as { _id: string })._id.toString(),
                        recipientRole: 'doctor',
                        type: 'appointment_booked',
                        title: 'New Appointment Booked',
                        message: `A patient has booked an appointment with you on ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.slotStart}.`,
                        metadata: { appointmentId: appointment._id.toString() },
                    }
                    await this._notificationService.createNotification(doctorPayload).catch(() => null)
                }

                await this._activityLogService.logActivity({
                    performedBy: payment.patientId.toString(),
                    performedByRole: 'patient',
                    category: 'appointment',
                    action: 'appointment_booked',
                    targetId: appointment._id.toString(),
                    targetType: 'appointment',
                    description: `Booked Appointment with Dr. ${doctorName} (Appointment ID: ${appointment._id})`,
                })

                await this._activityLogService.logActivity({
                    performedBy: payment.patientId.toString(),
                    performedByRole: 'patient',
                    category: 'appointment',
                    action: 'appointment_confirmed',
                    targetId: appointment._id.toString(),
                    targetType: 'appointment',
                    description: `Confirmed appointment with Dr. ${doctorName} (Appointment ID: ${appointment._id})`,
                })
            }
        }

        if (!updatedPayment) {
            const failedPayload: CreateNotificationPayload = {
                recipientId: payment.patientId.toString(),
                recipientRole: 'patient',
                type: 'payment_failed',
                title: 'Payment Failed',
                message: 'Your payment could not be processed. Please try again.',
                metadata: { appointmentId: payment.appointmentId?.toString() },
            }
            await this._notificationService.createNotification(failedPayload).catch(() => null)
            await this._activityLogService.logActivity({
                performedBy: payment.patientId.toString(),
                performedByRole: 'patient',
                category: 'payment',
                action: 'payment_failed',
                targetId: payment._id.toString(),
                targetType: 'payment',
                description: `Appointment payment failed`,
            })
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.UPDATE_FAILED)
        }

        await this._activityLogService.logActivity({
            performedBy: payment.patientId.toString(),
            performedByRole: 'patient',
            category: 'payment',
            action: 'payment_success',
            targetId: payment._id.toString(),
            targetType: 'payment',
            description: `Appointment payment completed via Razorpay (Appointment ID: ${payment.appointmentId})`,
        })

        return updatedPayment
    }
}
