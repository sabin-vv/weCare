import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IAppointmentService } from '../../appointment/interfaces/appointment.service.interface'
import { IDoctorService } from '../interfaces/doctor.service.interface'

@injectable()
export class DoctorController {
    constructor(
        @inject(TOKENS.IDoctorService) private _doctorService: IDoctorService,
        @inject(TOKENS.IAppointmentService) private _appointmentService: IAppointmentService,
    ) {}

    getProfile = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const result = await this._doctorService.getProfile(userId)

        res.status(HTTP_STATUS.OK).json({ success: true, message: 'Doctor profile fetched', data: result })
    }

    createProfile = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const result = await this._doctorService.createProfile(userId, req.body)

        res.status(HTTP_STATUS.CREATED).json({ success: true, message: 'Profile updated', data: result })
    }

    updateProfile = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const result = await this._doctorService.updateProfile(userId, req.body)

        res.status(HTTP_STATUS.OK).json({ success: true, message: 'Profile updated', data: result })
    }

    getAvailability = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const result = await this._doctorService.getAvailability(userId)

        res.status(HTTP_STATUS.OK).json({ success: true, message: 'Doctor availability fetched', data: result })
    }

    updateAvailability = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const result = await this._doctorService.updateAvailability(userId, req.body)

        res.status(HTTP_STATUS.OK).json({ success: true, message: 'Doctor availability updated', data: result })
    }

    searchDoctors = async (req: Request, res: Response) => {
        const { search, specialty, page, limit } = req.query

        const result = await this._doctorService.searchDoctors({
            search: search as string,
            specialty: specialty as string,
            page: parseInt(page as string) || 1,
            limit: parseInt(limit as string) || 8,
        })

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Doctors fetched successfully',
            data: result.doctors,
            specialties: result.specialties,
            totalCount: result.totalCount,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
        })
    }

    getDoctorById = async (req: Request, res: Response) => {
        const doctorId = req.params.doctorId as string

        const result = await this._doctorService.getDoctorById(doctorId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
        })
    }

    getDoctorSlots = async (req: Request, res: Response) => {
        const doctorId = req.params.doctorId as string
        const rawDate = req.query.date
        const dateParam = typeof rawDate === 'string' ? rawDate : undefined

        if (!dateParam) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Date query parameter is required')
        }

        const result = await this._doctorService.getDoctorSlots(doctorId, dateParam)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
        })
    }

    startConsultation = async (req: Request, res: Response) => {
        const doctorId = req.user?.userId
        if (!doctorId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const { patientId } = req.params
        if (!patientId) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Patient ID is required')
        }

        await this._appointmentService.startConsultation(doctorId, patientId as string)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Consultation started successfully',
        })
    }

    completeConsultation = async (req: Request, res: Response) => {
        const doctorId = req.user?.userId
        if (!doctorId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const { patientId } = req.params
        if (!patientId) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Patient ID is required')
        }

        await this._appointmentService.completeConsultation(doctorId, patientId as string)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Consultation completed successfully',
        })
    }
}
