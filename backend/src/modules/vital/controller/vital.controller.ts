import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IVitalService } from '../interfaces/vital.service.interface'
import { CreateVitalDTO, CreateVitalPlanDTO } from '../validator/vital.schema'

@injectable()
export class VitalController {
    constructor(@inject(TOKENS.IVitalService) private _vitalService: IVitalService) {}

    createVital = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const dto: CreateVitalDTO = req.body
        const vital = await this._vitalService.createVital(userId, dto)

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: vital,
        })
    }

    getPatientVitals = async (req: Request, res: Response) => {
        const { patientId } = req.params as { patientId: string }
        const { type } = req.query

        const vitals = await this._vitalService.getPatientVitals(patientId, type as string | undefined)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: vitals,
        })
    }

    createVitalPlan = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const dto: CreateVitalPlanDTO = req.body
        const plan = await this._vitalService.createVitalPlan(userId, dto)

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: plan,
        })
    }

    getPatientVitalPlans = async (req: Request, res: Response) => {
        const { patientId } = req.params as { patientId: string }
        const { status } = req.query

        const plans = await this._vitalService.getPatientVitalPlans(patientId, status as string | undefined)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: plans,
        })
    }

    cancelVitalPlan = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const { planId } = req.params as { planId: string }
        const plan = await this._vitalService.cancelVitalPlan(userId, planId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: plan,
            message: 'Vital plan cancelled successfully',
        })
    }

    getPatientVitalSchedules = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const schedules = await this._vitalService.getPatientVitalSchedules(userId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: schedules,
            message: 'Vital schedules fetched successfully',
        })
    }

    generateVitalSchedules = async (req: Request, res: Response) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        await this._vitalService.generateDailyVitalSchedule(today)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Daily vital schedules generated',
        })
    }
}
