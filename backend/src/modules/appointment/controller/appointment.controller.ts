import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IAppointmentService } from '../interfaces/appointment.service.interface'

@injectable()
export class AppointmentController {
    constructor(@inject(TOKENS.IAppointmentService) private _appointmentService: IAppointmentService) {}

    createAppointment = async (req: Request, res: Response) => {
        const patientId = req.user?.userId
        if (!patientId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const order = await this._appointmentService.createAppointment({
            ...req.body,
            patientId,
        })

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: order,
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
    cancellAppointment = async (req: Request, res: Response) => {
        const { appointmentId } = req.params
        const reason: string = req.body.reason

        const result = await this._appointmentService.cancelAppointment(appointmentId as string, reason)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message:
                result.refundAmount > 0
                    ? `Appointment cancelled. Refund of ₹${result.refundAmount} initiated.`
                    : 'Appointment cancelled successfully',
            data: { refundAmount: result.refundAmount },
        })
    }

    retryPayment = async (req: Request, res: Response) => {
        const patientId = req.user?.userId
        if (!patientId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const { appointmentId } = req.params as { appointmentId: string }
        const { paymentMethod } = req.body

        const result = await this._appointmentService.retryPayment(appointmentId, {
            paymentMethod,
            patientId,
        })

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
        })
    }
}
