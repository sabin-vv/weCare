import crypto from 'crypto'
import { Types } from 'mongoose'
import Razorpay from 'razorpay'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { env } from '../../../core/config/env'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IAdminRepository } from '../../admin/interfaces/admin.repository.interface'
import { IDoctorRepository } from '../../doctor/interfaces/doctor.repository.interface'
import { IAppointmentService } from '../interfaces/appointment.service.interface'
import { AppointmentRepository } from '../repository/appointment.repository'
import { AppointmentDocument } from '../types/appointment.types'

@injectable()
export class AppointmentService implements IAppointmentService {
    private razorpay: Razorpay

    constructor(
        @inject(TOKENS.IAppointmentRepository) private _appointmentRepo: AppointmentRepository,
        @inject(TOKENS.IDoctorRepository) private _doctorRepo: IDoctorRepository,
        @inject(TOKENS.IAdminRepository) private _adminRepo: IAdminRepository,
    ) {
        this.razorpay = new Razorpay({
            key_id: env.RAZORPAY_KEY_ID,
            key_secret: env.RAZORPAY_KEY_SECRET,
        })
    }

    async createOrder(patientId: string, doctorId: string, appointmentDate: string, slotStart: string): Promise<any> {
        const doctor = await this._doctorRepo.findById(doctorId)
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor not found')
        }

        // Check if slot is already booked or being processed
        const activeAppointments = await this._appointmentRepo.findActiveAppointments(
            doctor.userId.toString(),
            appointmentDate,
        )

        const now = new Date()
        const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000)

        const isAlreadyBooked = activeAppointments.some((app) => {
            if (app.slotStart !== slotStart) return false
            if (app.status === 'confirmed') return true
            if (app.status === 'pending') {
                return new Date(app.createdAt) > fifteenMinutesAgo
            }
            return false
        })

        if (isAlreadyBooked) {
            throw new AppError(HTTP_STATUS.CONFLICT, 'This slot is already booked or being processed.')
        }

        const settings = await this._adminRepo.getPlatformSettings()
        const totalAmount = (doctor.consultationFee + settings.platformFee) * 100

        const options = {
            amount: totalAmount,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        }

        const order = await this.razorpay.orders.create(options)

        await this._appointmentRepo.create({
            patientId: new Types.ObjectId(patientId),
            doctorId: new Types.ObjectId(doctor.userId.toString()),
            appointmentDate: new Date(appointmentDate),
            slotStart,
            amount: totalAmount / 100,
            status: 'pending',
            paymentStatus: 'pending',
            razorpayOrderId: order.id,
        })

        return order
    }

    async verifyPayment(
        razorpayOrderId: string,
        razorpayPaymentId: string,
        razorpaySignature: string,
    ): Promise<AppointmentDocument> {
        const secret = env.RAZORPAY_KEY_SECRET
        const body = razorpayOrderId + '|' + razorpayPaymentId

        const expectedSignature = crypto.createHmac('sha256', secret).update(body.toString()).digest('hex')

        const isSignatureValid = expectedSignature === razorpaySignature

        if (!isSignatureValid) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Invalid payment signature')
        }

        const appointment = await this._appointmentRepo.findByOrderId(razorpayOrderId)
        if (!appointment) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Appointment not found')
        }

        const updatedAppointment = await this._appointmentRepo.update(appointment._id.toString(), {
            paymentStatus: 'paid',
            status: 'confirmed',
            razorpayPaymentId,
            razorpaySignature,
        })

        if (!updatedAppointment) {
            throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update appointment')
        }

        return updatedAppointment
    }

    async getPatientAppointments(patientId: string): Promise<AppointmentDocument[]> {
        return await this._appointmentRepo.findByPatientId(patientId)
    }

    async getDoctorAppointments(doctorId: string): Promise<AppointmentDocument[]> {
        return await this._appointmentRepo.findByDoctorId(doctorId)
    }
}
