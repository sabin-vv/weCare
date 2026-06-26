import { Types } from 'mongoose'
import Razorpay from 'razorpay'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { env } from '../../../core/config/env'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IActivityLogService } from '../../activityLog/interfaces/activityLog.service.interface'
import { IAdminRepository } from '../../admin/interfaces/admin.repository.interface'
import { IDoctorRepository } from '../../doctor/interfaces/doctor.repository.interface'
import { INotificationService } from '../../notification/interfaces/notification.service.interface'
import { CreateNotificationPayload } from '../../notification/types/notification.types'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'
import { IPaymentRepository } from '../../payment/interfaces/payment.repository.interface'
import { IWalletService } from '../../wallet/interfaces/wallet.service.interface'
import { MSG } from '../constants/messages'
import { IAppointmentRepository } from '../interfaces/appointment.repository.interface'
import {
    CreateAppointmentResult,
    IAppointmentService,
    RazorpayAppointmentResponse,
    WalletAppointmentResponse,
} from '../interfaces/appointment.service.interface'
import { toAppointmentListResponseDTO, toAppointmentResponseDTO, toDoctorAppointmentRowDTO } from '../mapper/appointment.mapper'
import { AppointmentDocument, AppointmentResponseDTO, DoctorAppointmentsResponseDTO } from '../types/appointment.types'
import { CreateAppointmentDTO, RescheduleAppointmentDTO, RetryPaymentDTO } from '../validator/appointment.schema'

@injectable()
export class AppointmentService implements IAppointmentService {
    private razorpay: Razorpay

    constructor(
        @inject(TOKENS.IAppointmentRepository) private _appointmentRepo: IAppointmentRepository,
        @inject(TOKENS.IDoctorRepository) private _doctorRepo: IDoctorRepository,
        @inject(TOKENS.IAdminRepository) private _adminRepo: IAdminRepository,
        @inject(TOKENS.IPaymentRepository) private _paymentRepo: IPaymentRepository,
        @inject(TOKENS.IPatientRepository) private _patientRepo: IPatientRepository,
        @inject(TOKENS.IWalletService) private _walletService: IWalletService,
        @inject(TOKENS.INotificationService) private _notificationService: INotificationService,
        @inject(TOKENS.IActivityLogService) private _activityLogService: IActivityLogService,
    ) {
        this.razorpay = new Razorpay({
            key_id: env.RAZORPAY_KEY_ID,
            key_secret: env.RAZORPAY_KEY_SECRET,
        })
    }

    private async validateAppointmentRequest(dto: CreateAppointmentDTO & { patientId: string }) {
        const doctor = await this._doctorRepo.findById(dto.doctorId)
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.DOCTOR_NOT_FOUND)
        }

        const existingAppointment = await this._appointmentRepo.findActiveByPatientAndDoctor(
            dto.patientId,
            doctor._id.toString(),
        )
        if (existingAppointment) {
            throw new AppError(HTTP_STATUS.CONFLICT, MSG.ALREADY_ACTIVE_APPOINTMENT)
        }

        const activeAppointments = await this._appointmentRepo.findActiveAppointments(
            doctor._id.toString(),
            dto.appointmentDate,
        )

        const isAlreadyBooked = activeAppointments.some((app) => {
            if (app.slotStart !== dto.slotStart) return false
            if (app.status === 'confirmed') return true
            if (app.status === 'pending_payment') return true
            return false
        })

        if (isAlreadyBooked) {
            throw new AppError(HTTP_STATUS.CONFLICT, MSG.SLOT_ALREADY_BOOKED_OR_PROCESSING)
        }

        const settings = await this._adminRepo.getPlatformSettings()
        const totalAmount = doctor.consultationFee + settings.platformFee

        return {
            doctor,
            settings,
            totalAmount,
        }
    }

    private async generateNextAppointmentId(): Promise<string> {
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
        const lastId = await this._appointmentRepo.getLastAppointmentId()

        if (!lastId) return `APT-${today}-00001`

        const lastNum = parseInt(lastId.split('-')[2], 10)
        return `APT-${today}-${String(lastNum + 1).padStart(5, '0')}`
    }

    private async createBaseAppointment(
        dto: CreateAppointmentDTO & { patientId: string },
        consultationFee: number,
        status: AppointmentDocument['status'],
        expiredAt?: Date,
    ) {
        const appointmentId = await this.generateNextAppointmentId()

        return await this._appointmentRepo.create({
            patientId: new Types.ObjectId(dto.patientId),
            doctorId: new Types.ObjectId(dto.doctorId),
            appointmentDate: new Date(dto.appointmentDate),
            consultationFee,
            slotStart: dto.slotStart,
            slotEnd: dto.slotEnd,
            status,
            expiredAt,
            appointmentId,
        })
    }

    private async createBasePayment(
        dto: CreateAppointmentDTO & { patientId: string },
        appointmentId: Types.ObjectId,
        consultationFee: number,
        platformFee: number,
        totalAmount: number,
        status: 'pending' | 'success',
    ) {
        return await this._paymentRepo.create({
            patientId: new Types.ObjectId(dto.patientId),
            appointmentId,
            paymentType: 'consultation',
            paymentMethod: dto.paymentMethod,
            consultationFee,
            platformFee,
            totalAmount,
            status,
            paidAt: status === 'success' ? new Date() : undefined,
        })
    }

    private async createRazorpayAppointment(
        dto: CreateAppointmentDTO & { patientId: string },
        consultationFee: number,
        platformFee: number,
        totalAmount: number,
        doctorName: string,
    ): Promise<RazorpayAppointmentResponse> {
        const expiredAt = new Date(Date.now() + 10 * 60 * 1000)

        const appointment = await this.createBaseAppointment(dto, consultationFee, 'pending_payment', expiredAt)

        const payment = await this.createBasePayment(
            dto,
            appointment._id as Types.ObjectId,
            consultationFee,
            platformFee,
            totalAmount,
            'pending',
        )

        const order = await this.razorpay.orders.create({
            amount: totalAmount * 100,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        })
        const updatedRazorpayPayment = await this._paymentRepo.updateById(payment._id.toString(), {
            razorpayOrderId: order.id,
        })
        const updatedRazorpayAppointment = await this._appointmentRepo.update(appointment._id.toString(), {
            paymentId: payment._id,
        })

        if (!updatedRazorpayPayment || !updatedRazorpayAppointment) {
            throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, MSG.FAILED_PREPARE_RAZORPAY)
        }

        return { paymentMethod: 'razorpay', order, paymentId: payment._id.toString(), appointmentId: appointment._id.toString() }
    }

    private async createWalletAppointment(
        dto: CreateAppointmentDTO & { patientId: string },
        consultationFee: number,
        platformFee: number,
        totalAmount: number,
    ): Promise<WalletAppointmentResponse> {
        let appointment: AppointmentDocument | null = null
        let paymentId: string | null = null
        let walletDebited = false
        let doctorName = 'Doctor'

        try {
            appointment = await this.createBaseAppointment(dto, consultationFee, 'pending_payment')
            const payment = await this.createBasePayment(
                dto,
                appointment._id as Types.ObjectId,
                consultationFee,
                platformFee,
                totalAmount,
                'pending',
            )
            paymentId = payment._id.toString()

            const appointmentWithPayment = await this._appointmentRepo.update(appointment._id.toString(), {
                paymentId: payment._id,
            })
            if (!appointmentWithPayment) {
                throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, MSG.FAILED_ATTACH_PAYMENT)
            }

            const doctor = await this._doctorRepo.findByIdWithUser(dto.doctorId)
            doctorName = (doctor?.userId as unknown as { name?: string })?.name ?? 'Doctor'

            await this._activityLogService.logActivity({
                performedBy: dto.patientId,
                performedByRole: 'patient',
                category: 'appointment',
                action: 'appointment_booked',
                targetId: appointment._id.toString(),
                targetType: 'appointment',
                description: `Booked Appointment with Dr. ${doctorName} via wallet`,
            })

            const wallet = await this._walletService.debit(
                dto.patientId,
                totalAmount,
                `Consultation payment for Dr. ${doctorName}`,
                appointment._id.toString(),
            )
            walletDebited = true

            const updatedWalletPayment = await this._paymentRepo.updateById(payment._id.toString(), {
                status: 'success',
                paidAt: new Date(),
            })
            if (!updatedWalletPayment) {
                throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, MSG.FAILED_FINALIZE_WALLET)
            }

            await this._activityLogService.logActivity({
                performedBy: dto.patientId,
                performedByRole: 'patient',
                category: 'payment',
                action: 'payment_success',
                targetId: payment._id.toString(),
                targetType: 'payment',
                description: `Appointment Payment completed via wallet`,
            })

            const confirmedAppointment = await this._appointmentRepo.update(appointment._id.toString(), {
                paymentId: payment._id,
                status: 'confirmed',
                confirmedAt: new Date(),
                expiredAt: undefined,
            })
            if (!confirmedAppointment) {
                throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, MSG.FAILED_CONFIRM_WALLET)
            }

            await this._patientRepo.updateByUserId(new Types.ObjectId(dto.patientId), {
                primaryDoctorId: new Types.ObjectId(dto.doctorId),
            })

            await this._activityLogService.logActivity({
                performedBy: dto.patientId,
                performedByRole: 'patient',
                category: 'appointment',
                action: 'appointment_confirmed',
                targetId: appointment._id.toString(),
                targetType: 'appointment',
                description: `Appointment with Dr. ${doctorName} confirmed`,
            })

            const confirmedPayload: CreateNotificationPayload = {
                recipientId: dto.patientId,
                recipientRole: 'patient',
                type: 'appointment_confirmed',
                title: 'Appointment Confirmed',
                message: `Your appointment with Dr. ${doctorName} on ${new Date(dto.appointmentDate).toLocaleDateString()} at ${dto.slotStart} has been confirmed.`,
                metadata: { appointmentId: appointment._id.toString() },
            }
            await this._notificationService.createNotification(confirmedPayload).catch(() => null)

            if (doctor) {
                const doctorPayload: CreateNotificationPayload = {
                    recipientId: (doctor.userId as unknown as { _id: string })._id.toString(),
                    recipientRole: 'doctor',
                    type: 'appointment_booked',
                    title: 'New Appointment Booked',
                    message: `A patient has booked an appointment with you on ${new Date(dto.appointmentDate).toLocaleDateString()} at ${dto.slotStart}.`,
                    metadata: { appointmentId: appointment._id.toString() },
                }
                await this._notificationService.createNotification(doctorPayload).catch(() => null)
            }

            return {
                paymentMethod: 'wallet',
                paymentId: payment._id.toString(),
                appointmentId: appointment._id.toString(),
                walletBalance: wallet.balance,
                appointmentConfirmed: true,
            }
        } catch (error) {
            if (walletDebited && appointment) {
                await this._walletService
                    .credit(
                        dto.patientId,
                        totalAmount,
                        `Wallet payment reversal for Dr. ${doctorName}`,
                        appointment._id.toString(),
                    )
                    .catch(() => null)
            }
            if (paymentId) {
                await this._paymentRepo.delete(paymentId).catch(() => null)
            }
            if (appointment) {
                await this._appointmentRepo.delete(appointment._id.toString()).catch(() => null)
            }

            const failedPayload: CreateNotificationPayload = {
                recipientId: dto.patientId,
                recipientRole: 'patient',
                type: 'payment_failed',
                title: 'Payment Failed',
                message: 'Your wallet payment could not be processed. Please check your balance and try again.',
                metadata: { appointmentId: appointment?._id?.toString() },
            }
            await this._notificationService.createNotification(failedPayload).catch(() => null)

            throw error
        }
    }

    async createAppointment(dto: CreateAppointmentDTO & { patientId: string }): Promise<CreateAppointmentResult> {
        const { doctor, settings, totalAmount } = await this.validateAppointmentRequest(dto)

        if (dto.paymentMethod === 'wallet') {
            return await this.createWalletAppointment(dto, doctor.consultationFee, settings.platformFee, totalAmount)
        }

        const doctorName = (doctor?.userId as unknown as { name?: string })?.name ?? 'Doctor'
        return await this.createRazorpayAppointment(
            dto,
            doctor.consultationFee,
            settings.platformFee,
            totalAmount,
            doctorName,
        )
    }

    async getPatientAppointments(patientId: string): Promise<AppointmentResponseDTO[]> {
        const appointments = await this._appointmentRepo.findByPatientId(patientId)
        return toAppointmentListResponseDTO(appointments)
    }

    async getAppointmentById(appointmentId: string, patientId: string): Promise<AppointmentResponseDTO> {
        const appointment = await this._appointmentRepo.findByIdPopulated(appointmentId)
        if (!appointment) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.NOT_FOUND)
        }

        if (appointment.patientId.toString() !== patientId) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, MSG.NOT_YOUR_APPOINTMENT)
        }

        return toAppointmentResponseDTO(appointment)
    }

    async rescheduleAppointment(
        appointmentId: string,
        patientId: string,
        dto: RescheduleAppointmentDTO,
    ): Promise<AppointmentResponseDTO> {
        const appointment = await this._appointmentRepo.findById(appointmentId)
        if (!appointment) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.NOT_FOUND)
        }

        if (appointment.patientId.toString() !== patientId) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, MSG.NOT_YOUR_APPOINTMENT)
        }

        if (appointment.status !== 'confirmed') {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.ONLY_CONFIRMED_CAN_RESCHEDULE)
        }

        const appointmentDateTime = new Date(appointment.appointmentDate)
        const [hours, minutes] = appointment.slotStart.split(':').map(Number)
        appointmentDateTime.setHours(hours, minutes, 0, 0)
        const now = new Date()
        const hoursBefore = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
        if (hoursBefore <= 2) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.CANNOT_RESCHEDULE_WITHIN_2H)
        }

        const activeAppointments = await this._appointmentRepo.findActiveAppointments(
            appointment.doctorId.toString(),
            dto.appointmentDate,
        )
        const isSlotBooked = activeAppointments.some(
            (a) => a.slotStart === dto.slotStart && a.status !== 'cancelled',
        )
        if (isSlotBooked) {
            throw new AppError(HTTP_STATUS.CONFLICT, MSG.SLOT_ALREADY_BOOKED)
        }

        const updated = await this._appointmentRepo.update(appointmentId, {
            appointmentDate: new Date(dto.appointmentDate),
            slotStart: dto.slotStart,
            slotEnd: dto.slotEnd,
            rescheduledAt: new Date(),
        })
        if (!updated) {
            throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, MSG.FAILED_RESCHEDULE)
        }

        const doctor = await this._doctorRepo.findByIdWithUser(appointment.doctorId.toString()).catch(() => null)
        const doctorName = (doctor?.userId as unknown as { name?: string })?.name ?? 'Doctor'

        const reschedulePayload: CreateNotificationPayload = {
            recipientId: patientId,
            recipientRole: 'patient',
            type: 'appointment_rescheduled',
            title: 'Appointment Rescheduled',
            message: `Your appointment with Dr. ${doctorName} has been moved to ${new Date(dto.appointmentDate).toLocaleDateString()} at ${dto.slotStart}.`,
            metadata: { appointmentId },
        }
        await this._notificationService.createNotification(reschedulePayload).catch(() => null)

        await this._activityLogService.logActivity({
            performedBy: patientId,
            performedByRole: 'patient',
            category: 'appointment',
            action: 'appointment_rescheduled',
            targetId: appointmentId,
            targetType: 'appointment',
            description: `Rescheduled appointment with Dr. ${doctorName} to ${new Date(dto.appointmentDate).toLocaleDateString()} at ${dto.slotStart}`,
        })

        return toAppointmentResponseDTO(updated)
    }

    async getDoctorAppointments(
        doctorId: string,
        params: { search: string; page: number; limit: number; date?: string },
    ): Promise<DoctorAppointmentsResponseDTO> {
        const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(doctorId))
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.DOCTOR_PROFILE_NOT_FOUND)
        }

        const normalizedSearch = params.search.trim().toLowerCase()
        const page = Math.max(1, params.page || 1)
        const limit = Math.max(1, params.limit || 8)
        const appointments = params.date
            ? await this._appointmentRepo.findByDoctorIdForDate(doctor._id.toString(), params.date)
            : await this._appointmentRepo.findByDoctorId(doctor._id.toString())
        const doctorVisibleAppointments = appointments.filter(
            (appointment) => appointment.status === 'confirmed' || appointment.status === 'completed',
        )

        const mappedAppointments = await Promise.all(
            doctorVisibleAppointments.map(async (appointment) => {
                const patientUser = appointment.patientId
                if (typeof patientUser === 'string' || patientUser instanceof Types.ObjectId) {
                    return null
                }

                const patientProfile = await this._patientRepo.findByUserId(new Types.ObjectId(patientUser._id))
                if (!patientProfile) {
                    return null
                }

                return toDoctorAppointmentRowDTO(appointment, patientProfile, {
                    name: patientUser.name,
                    email: patientUser.email,
                })
            }),
        )

        const appointmentRows = mappedAppointments.filter(
            (appointment): appointment is NonNullable<typeof appointment> => !!appointment,
        )
        const filteredAppointmentRows = normalizedSearch
            ? appointmentRows.filter(
                  (appointment) =>
                      appointment.name.toLowerCase().includes(normalizedSearch) ||
                      appointment.email.toLowerCase().includes(normalizedSearch),
              )
            : appointmentRows
        const totalCount = filteredAppointmentRows.length
        const totalPages = Math.max(1, Math.ceil(totalCount / limit))
        const start = (page - 1) * limit
        const pagedAppointments = filteredAppointmentRows.slice(start, start + limit)

        return {
            appointments: pagedAppointments,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
            },
        }
    }

    async cancelAppointment(
        id: string,
        reason: string,
    ): Promise<{ appointment: AppointmentDocument | null; refundAmount: number }> {
        const appointment = await this._appointmentRepo.findById(id)

        if (!appointment) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.NOT_FOUND)
        }

        const appointmentDate = new Date(appointment.appointmentDate)
        const now = new Date()
        const hoursBeforeCancellation = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60)

        if (hoursBeforeCancellation <= 0) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.CANNOT_CANCEL)
        }

        let refundAmount = 0

        if (hoursBeforeCancellation > 24) {
            refundAmount = appointment.consultationFee
        } else if (hoursBeforeCancellation >= 2) {
            refundAmount = Math.floor(appointment.consultationFee * 0.5)
        }

        const cancelled = await this._appointmentRepo.cancelAppointment(id, reason, appointment.patientId.toString())

        if (cancelled) {
            if (refundAmount > 0 && appointment.paymentId) {
                const payment = await this._paymentRepo.findById(appointment.paymentId.toString())
                if (payment && payment.status === 'success') {
                    await this._walletService.credit(appointment.patientId.toString(), refundAmount, reason, id)
                    await this._paymentRepo.updateById(payment._id.toString(), { status: 'refunded' })
                }
            }

            const doctor = await this._doctorRepo.findByIdWithUser(appointment.doctorId.toString()).catch(() => null)
            const doctorName = (doctor?.userId as unknown as { name?: string })?.name ?? 'Doctor'

            const cancelPayload: CreateNotificationPayload = {
                recipientId: appointment.patientId.toString(),
                recipientRole: 'patient',
                type: 'appointment_cancelled',
                title: 'Appointment Cancelled',
                message: `Your appointment with Dr. ${doctorName} on ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.slotStart} has been cancelled.`,
                metadata: { appointmentId: id, reason },
            }
            await this._notificationService.createNotification(cancelPayload).catch(() => null)

            await this._activityLogService.logActivity({
                performedBy: appointment.patientId.toString(),
                performedByRole: 'patient',
                category: 'appointment',
                action: 'appointment_cancelled',
                targetId: id,
                targetType: 'appointment',
                description: `Cancelled appointment with Dr. ${doctorName}. Reason: ${reason}`,
            })

            if (refundAmount > 0) {
                await this._activityLogService.logActivity({
                    performedBy: appointment.patientId.toString(),
                    performedByRole: 'patient',
                    category: 'payment',
                    action: 'payment_refunded',
                    targetId: id,
                    targetType: 'payment',
                    description: `Refund of ₹${refundAmount} processed `,
                })
            }
        }

        return { appointment: cancelled, refundAmount }
    }

    async startConsultation(doctorId: string, patientId: string): Promise<void> {
        const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(doctorId))
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.DOCTOR_PROFILE_NOT_FOUND)
        }

        const patient = await this._patientRepo.findById(patientId)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PATIENT_NOT_FOUND)
        }

        const appointment = await this._appointmentRepo.findDoctorVisibleCurrentAppointment(
            doctor._id.toString(),
            patient.userId.toString(),
        )

        if (!appointment) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.NO_ACTIVE_APPOINTMENT)
        }

        if (appointment.status !== 'confirmed') {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.NOT_CONFIRMED)
        }

        await this._appointmentRepo.update(appointment._id.toString(), { status: 'in_consultation' })
    }

    async completeConsultation(doctorId: string, patientId: string): Promise<void> {
        const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(doctorId))
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.DOCTOR_PROFILE_NOT_FOUND)
        }

        const patient = await this._patientRepo.findById(patientId)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PATIENT_NOT_FOUND)
        }

        const appointment = await this._appointmentRepo.findDoctorVisibleCurrentAppointment(
            doctor._id.toString(),
            patient.userId.toString(),
        )

        if (!appointment) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.NO_ACTIVE_APPOINTMENT)
        }

        if (appointment.status !== 'in_consultation') {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.NOT_IN_CONSULTATION)
        }

        await this._appointmentRepo.update(appointment._id.toString(), { status: 'completed' })

        const patientExists = await this._patientRepo.findUserByUserId(appointment.patientId as Types.ObjectId)
        const patientName = (patientExists?.userId as unknown as { name: string })?.name

        await this._activityLogService.logActivity({
            performedBy: (doctor.userId as unknown as { _id: string })._id.toString(),
            performedByRole: 'doctor',
            category: 'appointment',
            action: 'appointment_completed',
            targetId: appointment._id.toString(),
            targetType: 'appointment',
            description: `Appointment completed for patient ${patientName} by Dr. ${(doctor.userId as unknown as { name?: string }).name}`,
        })
    }

    async retryPayment(
        appointmentId: string,
        dto: RetryPaymentDTO & { patientId: string },
    ): Promise<CreateAppointmentResult> {
        const appointment = await this._appointmentRepo.findById(appointmentId)

        if (!appointment) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.NOT_FOUND)
        }

        const patientExists = await this._patientRepo.findUserByUserId(appointment.patientId as Types.ObjectId)
        const patientName = (patientExists?.userId as unknown as { name: string })?.name

        if (appointment.status !== 'pending_payment') {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.NOT_PENDING_PAYMENT)
        }

        if (appointment.patientId.toString() !== dto.patientId) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, MSG.NOT_AUTHORIZED_RETRY_PAYMENT)
        }

        const settings = await this._adminRepo.getPlatformSettings()
        const totalAmount = appointment.consultationFee + (settings.platformFee ?? 0)

        if (dto.paymentMethod === 'wallet') {
            let wallet: { balance: number }

            try {
                wallet = await this._walletService.debit(
                    dto.patientId,
                    totalAmount,
                    `Consultation payment for appointment ${patientName}`,
                    appointmentId,
                )

                await this._appointmentRepo.update(appointmentId, { status: 'confirmed', confirmedAt: new Date() })
                await this._patientRepo.updateByUserId(new Types.ObjectId(dto.patientId), {
                    primaryDoctorId: appointment.doctorId as Types.ObjectId,
                })

                if (appointment.paymentId) {
                    await this._paymentRepo.updateById(appointment.paymentId.toString(), {
                        status: 'success',
                        paidAt: new Date(),
                    })

                    await this._activityLogService.logActivity({
                        performedBy: dto.patientId,
                        performedByRole: 'patient',
                        category: 'payment',
                        action: 'payment_success',
                        targetId: appointment.paymentId.toString(),
                        targetType: 'payment',
                        description: `Wallet payment completed for appointment ${patientName}`,
                    })
                }
            } catch (error) {
                const failedPayload: CreateNotificationPayload = {
                    recipientId: dto.patientId,
                    recipientRole: 'patient',
                    type: 'payment_failed',
                    title: 'Payment Failed',
                    message: 'Your wallet payment could not be processed. Please check your balance and try again.',
                    metadata: { appointmentId },
                }
                await this._notificationService.createNotification(failedPayload).catch(() => null)
                throw error
            }

            const retryDoctor = await this._doctorRepo
                .findByIdWithUser(appointment.doctorId.toString())
                .catch(() => null)
            const retryDoctorName = (retryDoctor?.userId as unknown as { name?: string })?.name ?? 'Doctor'

            const retryConfirmedPayload: CreateNotificationPayload = {
                recipientId: dto.patientId,
                recipientRole: 'patient',
                type: 'appointment_confirmed',
                title: 'Appointment Confirmed',
                message: `Your appointment with Dr. ${retryDoctorName} on ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.slotStart} has been confirmed.`,
                metadata: { appointmentId },
            }
            await this._notificationService.createNotification(retryConfirmedPayload).catch(() => null)

            await this._activityLogService.logActivity({
                performedBy: dto.patientId,
                performedByRole: 'patient',
                category: 'appointment',
                action: 'appointment_confirmed',
                targetId: appointmentId,
                targetType: 'appointment',
                description: `Confirmed via wallet retry for Dr. ${retryDoctorName}`,
            })

            if (retryDoctor) {
                const doctorPayload: CreateNotificationPayload = {
                    recipientId: (retryDoctor.userId as unknown as { _id: string })._id.toString(),
                    recipientRole: 'doctor',
                    type: 'appointment_booked',
                    title: 'New Appointment Booked',
                    message: `A patient has booked an appointment with you on ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.slotStart}.`,
                    metadata: { appointmentId },
                }
                await this._notificationService.createNotification(doctorPayload).catch(() => null)
            }

            return {
                paymentMethod: 'wallet',
                paymentId: appointment.paymentId?.toString() ?? '',
                appointmentId,
                walletBalance: wallet.balance,
                appointmentConfirmed: true,
            }
        }

        const razorpayOrder = await this.razorpay.orders.create({
            amount: totalAmount * 100,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        })

        if (appointment.paymentId) {
            await this._paymentRepo.updateById(appointment.paymentId.toString(), { razorpayOrderId: razorpayOrder.id })
        }

        return {
            paymentMethod: 'razorpay',
            order: razorpayOrder,
            paymentId: appointment.paymentId?.toString() ?? '',
            appointmentId: appointment._id.toString(),
        }
    }
}
