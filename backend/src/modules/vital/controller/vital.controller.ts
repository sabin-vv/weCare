import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { MSG } from '../constants/messages'
import { IVitalService } from '../interfaces/vital.service.interface'
import { CreateVitalPlanDTO } from '../validator/vital.schema'

@injectable()
export class VitalController {
    constructor(@inject(TOKENS.IVitalService) private _vitalService: IVitalService) {}

    createVitalPlan = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
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
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const { planId } = req.params as { planId: string }
        const plan = await this._vitalService.cancelVitalPlan(userId, planId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: plan,
            message: MSG.PLAN_CANCELLED,
        })
    }

    getPatientVitalSchedules = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const schedules = await this._vitalService.getPatientVitalSchedules(userId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: schedules,
            message: MSG.SCHEDULES_FETCHED,
        })
    }

    generateVitalSchedules = async (req: Request, res: Response) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        await this._vitalService.generateDailyVitalSchedule(today)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MSG.GENERATED,
        })
    }
}
