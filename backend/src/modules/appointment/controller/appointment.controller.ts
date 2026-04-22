import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IAppointmentService } from '../interfaces/appointment.service.interface'

@injectable()
export class AppointmentController {
    constructor(@inject(TOKENS.IAppointmentService) private _appointmentService: IAppointmentService) {}

    createOrder = async (req: Request, res: Response) => {
        const patientId = req.user?.userId
        if (!patientId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const { doctorId, appointmentDate, slotStart } = req.body

        if (!doctorId || !appointmentDate || !slotStart) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Missing required fields')
        }

        const order = await this._appointmentService.createOrder(patientId, doctorId, appointmentDate, slotStart)

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Order created successfully',
            data: order,
        })
    }

    verifyPayment = async (req: Request, res: Response) => {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Missing payment details')
        }

        const appointment = await this._appointmentService.verifyPayment(
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        )

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Payment verified successfully',
            data: appointment,
        })
    }

    getPatientAppointments = async (req: Request, res: Response) => {
        const patientId = req.user?.userId
        if (!patientId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const appointments = await this._appointmentService.getPatientAppointments(patientId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Appointments fetched successfully',
            data: appointments,
        })
    }
}
