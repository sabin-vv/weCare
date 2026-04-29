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
import { IPaymentRepository } from '../../payment/interfaces/payment.repository.interface'
import { IAppointmentService } from '../interfaces/appointment.service.interface'
import { RazorpayOrder } from '../interfaces/appointment.service.interface'
import { AppointmentResponseDTO, toAppointmentListResponseDTO } from '../mapper/appointment.mapper'
import { AppointmentRepository } from '../repository/appointment.repository'
import { CreateAppointmentDTO } from '../validator/appointment.schema'

@injectable()
export class AppointmentService implements IAppointmentService {
    private razorpay: Razorpay

    constructor(
        @inject(TOKENS.IAppointmentRepository) private _appointmentRepo: AppointmentRepository,
        @inject(TOKENS.IDoctorRepository) private _doctorRepo: IDoctorRepository,
        @inject(TOKENS.IAdminRepository) private _adminRepo: IAdminRepository,
        @inject(TOKENS.IPaymentRepository) private _paymentRepo: IPaymentRepository,
    ) {
        this.razorpay = new Razorpay({
            key_id: env.RAZORPAY_KEY_ID,
            key_secret: env.RAZORPAY_KEY_SECRET,
        })
    }

    async createAppointment(
        dto: CreateAppointmentDTO & { patientId: string },
    ): Promise<{ order: RazorpayOrder; paymentId: string }> {
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

        const expiredAt = new Date(Date.now() + 10 * 60 * 1000)

        const appointment = await this._appointmentRepo.create({
            patientId: new Types.ObjectId(dto.patientId),
            doctorId: new Types.ObjectId(doctor._id),
            appointmentDate: new Date(dto.appointmentDate),
            consultationFee: doctor.consultationFee,
            slotStart: dto.slotStart,
            slotEnd: dto.slotEnd,
            status: 'pending_payment',
            expiredAt,
        })

        const settings = await this._adminRepo.getPlatformSettings()
        const totalAmount = doctor.consultationFee + settings.platformFee

        const payment = await this._paymentRepo.create({
            patientId: new Types.ObjectId(dto.patientId),
            appointmentId: appointment._id,
            paymentType: 'consultation',
            consultationFee: doctor.consultationFee,
            platformFee: settings.platformFee,
            totalAmount,
            status: 'pending',
        })

        const order = await this.razorpay.orders.create({
            amount: totalAmount * 100,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        })
        await this._paymentRepo.updateById(payment._id.toString(), {
            razorpayOrderId: order.id,
        })
        await this._appointmentRepo.update(appointment._id.toString(), {
            paymentId: payment._id,
        })

        return { order, paymentId: payment._id.toString() }
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
}
