import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IFeedbackService } from '../interfaces/feedback.service.interface'

@injectable()
export class FeedbackController {
    constructor(
        @inject(TOKENS.IFeedbackService)
        private _feedbackService: IFeedbackService,
    ) {}

    submitFeedback = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')

        const result = await this._feedbackService.submitFeedback(userId, req.body)
        res.status(HTTP_STATUS.CREATED).json({ success: true, message: 'Feedback submitted successfully', data: result })
    }
}
