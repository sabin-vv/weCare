import { Types } from 'mongoose'
import Razorpay from 'razorpay'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { env } from '../../../core/config/env'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { logger } from '../../../core/logger/logger'
import { IAdminRepository } from '../../admin/interfaces/admin.repository.interface'
import { IDoctorRepository } from '../../doctor/interfaces/doctor.repository.interface'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'
import { IPaymentRepository } from '../../payment/interfaces/payment.repository.interface'
import { IWalletService } from '../../wallet/interfaces/wallet.service.interface'
import { IAppointmentRepository } from '../interfaces/appointment.repository.interface'
import {
    CreateAppointmentResult,
    IAppointmentService,
    RazorpayAppointmentResponse,
    WalletAppointmentResponse,
} from '../interfaces/appointment.service.interface'
import { AppointmentResponseDTO, toAppointmentListResponseDTO } from '../mapper/appointment.mapper'
import { AppointmentDocument } from '../types/appointment.types'
import { CreateAppointmentDTO, RetryPaymentDTO } from '../validator/appointment.schema'

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
    ) {
        this.razorpay = new Razorpay({
            key_id: env.RAZORPAY_KEY_ID,
            key_secret: env.RAZORPAY_KEY_SECRET,
        })
    }

    private async validateAppointmentRequest(dto: CreateAppointmentDTO & { patientId: string }) {
        const doctor = await this._doctorRepo.findById(dto.doctorId)
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor not found')
        }

        const existingAppointment = await this._appointmentRepo.findActiveByPatientAndDoctor(
            dto.patientId,
            doctor._id.toString(),
        )
        if (existingAppointment) {
            throw new AppError(HTTP_STATUS.CONFLICT, 'You already have an active appointment with this doctor')
        }

        const activeAppointments = await this._appointmentRepo.findActiveAppointments(
            doctor._id.toString(),
            dto.appointmentDate,
        )

        const now = new Date()

        const isAlreadyBooked = activeAppointments.some((app) => {
            if (app.slotStart !== dto.slotStart) return false
            if (app.status === 'confirmed') return true
            if (app.status === 'pending_payment') {
                return app.expiredAt && new Date(app.expiredAt) > now
            }
            return false
        })

        if (isAlreadyBooked) {
            throw new AppError(HTTP_STATUS.CONFLICT, 'This slot is already booked or being processed.')
        }

        const settings = await this._adminRepo.getPlatformSettings()
        const totalAmount = doctor.consultationFee + settings.platformFee

        return {
            doctor,
            settings,
            totalAmount,
        }
    }

    private async createBaseAppointment(
        dto: CreateAppointmentDTO & { patientId: string },
        consultationFee: number,
        status: AppointmentDocument['status'],
        expiredAt?: Date,
    ) {
        return await this._appointmentRepo.create({
            patientId: new Types.ObjectId(dto.patientId),
            doctorId: new Types.ObjectId(dto.doctorId),
            appointmentDate: new Date(dto.appointmentDate),
            consultationFee,
            slotStart: dto.slotStart,
            slotEnd: dto.slotEnd,
            status,
            expiredAt,
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
            throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to prepare Razorpay appointment payment')
        }

        return { paymentMethod: 'razorpay', order, paymentId: payment._id.toString() }
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
                throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to attach payment to appointment')
            }

            const wallet = await this._walletService.debit(
                dto.patientId,
                totalAmount,
                `Consultation payment for appointment ${appointment._id.toString()}`,
                appointment._id.toString(),
            )
            walletDebited = true

            const updatedWalletPayment = await this._paymentRepo.updateById(payment._id.toString(), {
                status: 'success',
                paidAt: new Date(),
            })
            if (!updatedWalletPayment) {
                throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to finalize wallet payment')
            }

            const confirmedAppointment = await this._appointmentRepo.update(appointment._id.toString(), {
                paymentId: payment._id,
                status: 'confirmed',
                expiredAt: undefined,
            })
            if (!confirmedAppointment) {
                throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to confirm wallet appointment')
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
                        `Wallet payment reversal for appointment ${appointment._id.toString()}`,
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
            throw error
        }
    }

    async createAppointment(dto: CreateAppointmentDTO & { patientId: string }): Promise<CreateAppointmentResult> {
        const { doctor, settings, totalAmount } = await this.validateAppointmentRequest(dto)

        await this._patientRepo.updateByUserId(new Types.ObjectId(dto.patientId), { primaryDoctorId: doctor._id })

        if (dto.paymentMethod === 'wallet') {
            return await this.createWalletAppointment(dto, doctor.consultationFee, settings.platformFee, totalAmount)
        }

        return await this.createRazorpayAppointment(dto, doctor.consultationFee, settings.platformFee, totalAmount)
    }

    async getPatientAppointments(patientId: string): Promise<AppointmentResponseDTO[]> {
        const appointments = await this._appointmentRepo.findByPatientId(patientId)
        logger.info({ Appointment: appointments })
        return toAppointmentListResponseDTO(appointments)
    }

    async getDoctorAppointments(doctorId: string): Promise<AppointmentResponseDTO[]> {
        const appointments = await this._appointmentRepo.findByDoctorId(doctorId)
        return toAppointmentListResponseDTO(appointments)
    }
    async cancelAppointment(
        id: string,
        reason: string,
    ): Promise<{ appointment: AppointmentDocument | null; refundAmount: number }> {
        const appointment = await this._appointmentRepo.findById(id)

        if (!appointment) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Appointment not found')
        }

        const appointmentDate = new Date(appointment.appointmentDate)
        const now = new Date()
        const hoursBeforeCancellation = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60)

        if (hoursBeforeCancellation <= 0) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Cannot cancel this appointment')
        }

        let refundAmount = 0

        if (hoursBeforeCancellation > 24) {
            refundAmount = appointment.consultationFee
        } else if (hoursBeforeCancellation >= 2) {
            refundAmount = Math.floor(appointment.consultationFee * 0.5)
        }

        if (refundAmount > 0 && appointment.paymentId) {
            const payment = await this._paymentRepo.findById(appointment.paymentId.toString())
            if (payment && payment.status === 'success') {
                await this._walletService.credit(appointment.patientId.toString(), refundAmount, reason, id)
                await this._paymentRepo.updateById(payment._id.toString(), { status: 'refunded' })
            }
        }

        const cancelled = await this._appointmentRepo.cancelAppointment(id)
        return { appointment: cancelled, refundAmount }
    }

    async startConsultation(doctorId: string, patientId: string): Promise<void> {
        const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(doctorId))
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor profile not found')
        }

        const patient = await this._patientRepo.findById(patientId)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient not found')
        }

        const appointment = await this._appointmentRepo.findCurrentAppointment(
            doctor._id.toString(),
            patient.userId.toString(),
        )

        if (!appointment) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'No active appointment found')
        }

        if (appointment.status !== 'confirmed') {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Appointment is not confirmed')
        }

        await this._appointmentRepo.update(appointment._id.toString(), { status: 'in_consultation' })
    }

    async retryPayment(appointmentId: string, dto: RetryPaymentDTO & { patientId: string }): Promise<CreateAppointmentResult> {
        const appointment = await this._appointmentRepo.findById(appointmentId)

        if (!appointment) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Appointment not found')
        }

        if (appointment.status !== 'pending_payment') {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Appointment is not pending payment')
        }

        if (appointment.patientId.toString() !== dto.patientId) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'You are not authorized to retry payment for this appointment')
        }

        const settings = await this._adminRepo.getPlatformSettings()
        const totalAmount = appointment.consultationFee + (settings.platformFee ?? 0)

        if (dto.paymentMethod === 'wallet') {
            const wallet = await this._walletService.debit(
                dto.patientId,
                totalAmount,
                `Consultation payment for appointment ${appointmentId}`,
                appointmentId,
            )

            await this._appointmentRepo.update(appointmentId, { status: 'confirmed' })

            if (appointment.paymentId) {
                await this._paymentRepo.updateById(appointment.paymentId.toString(), { status: 'success', paidAt: new Date() })
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
        }
    }
}
