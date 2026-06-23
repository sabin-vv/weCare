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

    getDoctorAppointments = async (req: Request, res: Response) => {
        const doctorId = req.user?.userId
        if (!doctorId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const appointments = await this._appointmentService.getDoctorAppointments(doctorId, {
            search: (req.query.search as string)?.trim() || '',
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 8,
            date: (req.query.date as string)?.trim() || undefined,
        })

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Doctor appointments fetched successfully',
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

    getAppointmentById = async (req: Request, res: Response) => {
        const patientId = req.user?.userId
        if (!patientId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const { appointmentId } = req.params as { appointmentId: string }
        const appointment = await this._appointmentService.getAppointmentById(appointmentId, patientId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: appointment,
        })
    }

    rescheduleAppointment = async (req: Request, res: Response) => {
        const patientId = req.user?.userId
        if (!patientId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const { appointmentId } = req.params as { appointmentId: string }

        const appointment = await this._appointmentService.rescheduleAppointment(
            appointmentId,
            patientId,
            req.body,
        )

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Appointment rescheduled successfully',
            data: appointment,
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
