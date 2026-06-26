import { Request, Response } from 'express'
import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { MSG } from '../constants/messages'
import { ICaregiverRepository } from '../interfaces/caregiver.repository.interface'
import { ICaregiverService } from '../interfaces/caregiver.service.interface'
import { LogMedicationDTO, LogSymptomDTO, LogVitalReadingDTO } from '../validator/caregiverLogging.schema'

@injectable()
export class CaregiverController {
    constructor(
        @inject(TOKENS.ICaregiverService) private _caregiverService: ICaregiverService,
        @inject(TOKENS.ICaregiverRepository) private _caregiverRepo: ICaregiverRepository,
    ) {}

    createProfile = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const result = await this._caregiverService.createProfile(userId, req.body)

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: result,
            message: MSG.PROFILE_CREATED,
        })
    }

    getProfile = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const result = await this._caregiverService.getProfile(userId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: MSG.PROFILE_FETCHED,
        })
    }

    updateProfile = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const result = await this._caregiverService.updateProfile(userId, req.body)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: MSG.PROFILE_UPDATED,
        })
    }

    listCaregivers = async (req: Request, res: Response) => {
        const { search } = req.query

        const result = await this._caregiverService.listCaregivers(search as string | undefined)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: MSG.CAREGIVERS_FETCHED,
        })
    }

    getPatientMedications = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PROFILE_NOT_FOUND)
        }

        const { patientId } = req.params as { patientId: string }

        const medications = await this._caregiverService.getPatientMedications(caregiver._id, patientId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: medications,
            message: MSG.PATIENT_MEDICATIONS_FETCHED,
        })
    }

    getPatientVitalPlans = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PROFILE_NOT_FOUND)
        }

        const { patientId } = req.params as { patientId: string }

        const vitalPlans = await this._caregiverService.getPatientVitalPlans(caregiver._id, patientId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: vitalPlans,
            message: MSG.PATIENT_VITAL_PLANS_FETCHED,
        })
    }

    getPatientVitalSchedules = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PROFILE_NOT_FOUND)
        }

        const { patientId } = req.params as { patientId: string }

        const schedules = await this._caregiverService.getPatientVitalSchedules(caregiver._id, patientId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: schedules,
            message: MSG.PATIENT_VITAL_SCHEDULES_FETCHED,
        })
    }

    getMyPatients = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PROFILE_NOT_FOUND)
        }

        const patients = await this._caregiverService.getMyPatients(caregiver._id)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: patients,
            message: MSG.PATIENTS_FETCHED,
        })
    }

    getAlerts = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PROFILE_NOT_FOUND)
        }

        const { type, severity, status, limit, page } = req.query as {
            type?: string
            severity?: string
            status?: string
            limit?: string
            page?: string
        }

        const result = await this._caregiverService.getAlerts(caregiver._id, {
            type,
            severity,
            status,
            limit: limit ? Number(limit) : undefined,
            page: page ? Number(page) : undefined,
        })

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: MSG.ALERTS_FETCHED,
        })
    }

    logMedication = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PROFILE_NOT_FOUND)
        }

        const { patientId, scheduleId } = req.params as { patientId: string; scheduleId: string }
        const result = await this._caregiverService.logMedication(
            caregiver._id,
            patientId,
            scheduleId,
            req.body as LogMedicationDTO,
        )

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: MSG.MEDICATION_LOG_SAVED,
        })
    }

    logVitalReading = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PROFILE_NOT_FOUND)
        }

        const { patientId } = req.params as { patientId: string }
        const result = await this._caregiverService.logVitalReading(
            caregiver._id,
            patientId,
            req.body as LogVitalReadingDTO,
        )

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: result,
            message: MSG.VITAL_READING_SAVED,
        })
    }

    logSymptom = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PROFILE_NOT_FOUND)
        }

        const { patientId } = req.params as { patientId: string }
        const result = await this._caregiverService.logSymptom(caregiver._id, patientId, req.body as LogSymptomDTO)

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: result,
            message: MSG.SYMPTOM_LOG_SAVED,
        })
    }
}
