import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IAppointmentService } from '../../appointment/interfaces/appointment.service.interface'
import { MSG } from '../constants/messages'
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
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const result = await this._doctorService.getProfile(userId)

        res.status(HTTP_STATUS.OK).json({ success: true, message: MSG.PROFILE_FETCHED, data: result })
    }

    createProfile = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const result = await this._doctorService.createProfile(userId, req.body)

        res.status(HTTP_STATUS.CREATED).json({ success: true, message: MSG.PROFILE_UPDATED, data: result })
    }

    updateProfile = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const result = await this._doctorService.updateProfile(userId, req.body)

        res.status(HTTP_STATUS.OK).json({ success: true, message: MSG.PROFILE_UPDATED, data: result })
    }

    getAvailability = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const result = await this._doctorService.getAvailability(userId)

        res.status(HTTP_STATUS.OK).json({ success: true, message: MSG.AVAILABILITY_FETCHED, data: result })
    }

    updateAvailability = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const result = await this._doctorService.updateAvailability(userId, req.body)

        res.status(HTTP_STATUS.OK).json({ success: true, message: MSG.AVAILABILITY_UPDATED, data: result })
    }

    private validSortBy = ['rating', 'name', 'newest'] as const
    private validSortOrder = ['asc', 'desc'] as const

    searchDoctors = async (req: Request, res: Response) => {
        const { search, specialty, page, limit, sortBy, sortOrder } = req.query

        if (sortBy !== undefined && !this.validSortBy.includes(sortBy as typeof this.validSortBy[number])) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, `Invalid sortBy value. Allowed: ${this.validSortBy.join(', ')}`)
        }

        if (
            sortOrder !== undefined &&
            !this.validSortOrder.includes(sortOrder as typeof this.validSortOrder[number])
        ) {
            throw new AppError(
                HTTP_STATUS.BAD_REQUEST,
                `Invalid sortOrder value. Allowed: ${this.validSortOrder.join(', ')}`,
            )
        }

        const result = await this._doctorService.searchDoctors({
            search: search as string,
            specialty: specialty as string,
            page: parseInt(page as string) || 1,
            limit: parseInt(limit as string) || 8,
            sortBy: sortBy as 'rating' | 'name' | 'newest' | undefined,
            sortOrder: sortOrder as 'asc' | 'desc' | undefined,
        })

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MSG.DOCTORS_FETCHED,
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
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.DATE_REQUIRED)
        }

        const result = await this._doctorService.getDoctorSlots(doctorId, dateParam)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
        })
    }

    getDashboard = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const result = await this._doctorService.getDashboardStats(userId)

        res.status(HTTP_STATUS.OK).json({ success: true, message: MSG.DASHBOARD_FETCHED, data: result })
    }

    getAppointmentStats = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const startDate = (req.query.startDate as string)?.trim()
        const endDate = (req.query.endDate as string)?.trim()

        if (!startDate || !endDate) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.START_END_DATE_REQUIRED)
        }

        const result = await this._doctorService.getAppointmentStats(userId, startDate, endDate)

        res.status(HTTP_STATUS.OK).json({ success: true, data: result })
    }

    startConsultation = async (req: Request, res: Response) => {
        const doctorId = req.user?.userId
        if (!doctorId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const { patientId } = req.params
        if (!patientId) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.PATIENT_ID_REQUIRED)
        }

        await this._appointmentService.startConsultation(doctorId, patientId as string)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MSG.CONSULTATION_STARTED,
        })
    }

    completeConsultation = async (req: Request, res: Response) => {
        const doctorId = req.user?.userId
        if (!doctorId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const { patientId } = req.params
        if (!patientId) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.PATIENT_ID_REQUIRED)
        }

        await this._appointmentService.completeConsultation(doctorId, patientId as string)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MSG.CONSULTATION_COMPLETED,
        })
    }
}
