import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { ICaregiverService } from '../interfaces/caregiver.service.interface'

@injectable()
export class CaregiverController {
    constructor(@inject(TOKENS.ICaregiverService) private _caregiverService: ICaregiverService) {}

    registerCaregiver = async (req: Request, res: Response) => {
        const result = await this._caregiverService.registerCaregiver(req.body, {})

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: result,
            message: 'Caregiver registered successfully',
        })
    }

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
}
