import { Request, Response } from 'express'
import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
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
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const result = await this._caregiverService.createProfile(userId, req.body)

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: result,
            message: 'Profile created successfully',
        })
    }

    getProfile = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const result = await this._caregiverService.getProfile(userId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: 'Caregiver profile fetched',
        })
    }

    updateProfile = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const result = await this._caregiverService.updateProfile(userId, req.body)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: 'Profile updated successfully',
        })
    }

    listCaregivers = async (req: Request, res: Response) => {
        const { search } = req.query

        const result = await this._caregiverService.listCaregivers(search as string | undefined)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: 'Caregivers list fetched',
        })
    }

    getPatientMedications = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver profile not found')
        }

        const { patientId } = req.params as { patientId: string }

        const medications = await this._caregiverService.getPatientMedications(caregiver._id, patientId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: medications,
            message: 'Patient medications fetched',
        })
    }

    getPatientVitalPlans = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver profile not found')
        }

        const { patientId } = req.params as { patientId: string }

        const vitalPlans = await this._caregiverService.getPatientVitalPlans(caregiver._id, patientId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: vitalPlans,
            message: 'Patient vital plans fetched',
        })
    }

    getPatientVitalSchedules = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver profile not found')
        }

        const { patientId } = req.params as { patientId: string }

        const schedules = await this._caregiverService.getPatientVitalSchedules(caregiver._id, patientId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: schedules,
            message: 'Patient vital schedules fetched',
        })
    }

    getMyPatients = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver profile not found')
        }

        const patients = await this._caregiverService.getMyPatients(caregiver._id)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: patients,
            message: 'Patients fetched',
        })
    }

    getAlerts = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver profile not found')
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
            message: 'Alerts fetched',
        })
    }

    logMedication = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver profile not found')
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
            message: 'Medication log saved',
        })
    }

    logVitalReading = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver profile not found')
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
            message: 'Vital reading saved',
        })
    }

    logSymptom = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver profile not found')
        }

        const { patientId } = req.params as { patientId: string }
        const result = await this._caregiverService.logSymptom(caregiver._id, patientId, req.body as LogSymptomDTO)

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: result,
            message: 'Symptom log saved',
        })
    }
}
