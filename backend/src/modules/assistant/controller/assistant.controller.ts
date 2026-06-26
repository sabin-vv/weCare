import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { UserRole } from '../../auth/types/auth.types'
import { MSG } from '../constants/messages'
import { IAssistantService } from '../interfaces/assistant.service.interface'
import type { AssistantChatRequest } from '../types/assistant.types'

@injectable()
export class AssistantController {
    constructor(@inject(TOKENS.IAssistantService) private readonly assistantService: IAssistantService) {}

    chat = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        const role = req.user?.role

        if (!userId || !role) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const { message } = req.body as AssistantChatRequest
        if (!message || !message.trim() || typeof message !== 'string') {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.MESSAGE_REQUIRED)
        }

        if (message.length > 500) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.MESSAGE_TOO_LONG)
        }

        if (role !== UserRole.PATIENT) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, MSG.ONLY_PATIENTS_ACCESS)
        }

        const response = await this.assistantService.chat({ userId, role, message })
        res.status(HTTP_STATUS.OK).json({ success: true, data: response })
    }
}
