import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { ISubscriptionService } from '../interfaces/subscription.service.interface'
import { createSubscriptionSchema } from '../validator/subscription.schema'

@injectable()
export class SubscriptionController {
    constructor(@inject(TOKENS.ISubscriptionService) private _subscriptionService: ISubscriptionService) {}

    getMySubscription = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const subscription = await this._subscriptionService.getMySubscription(userId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: subscription,
            message: subscription ? 'Subscription fetched successfully' : 'No active subscription found',
        })
    }

    createSubscription = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        const role = req.user?.role
        if (!userId || !role) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const dto = createSubscriptionSchema.parse(req.body)
        const result = await this._subscriptionService.createSubscription(userId, role, dto)

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: result,
            message: 'Subscription created, proceed with payment',
        })
    }

    verifySubscriptionPayment = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        const role = req.user?.role
        if (!userId || !role) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const subscription = await this._subscriptionService.verifySubscriptionPayment(userId, role, req.body)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: subscription,
            message: 'Subscription activated successfully',
        })
    }

    cancelSubscription = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        const role = req.user?.role
        if (!userId || !role) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const { subscriptionId } = req.params as { subscriptionId: string }
        await this._subscriptionService.cancelSubscription(subscriptionId, userId, role)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Subscription cancelled',
        })
    }
}