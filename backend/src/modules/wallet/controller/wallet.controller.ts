import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { MSG } from '../constants/messages'
import { IWalletService } from '../interfaces/wallet.service.interface'

@injectable()
export class WalletController {
    constructor(@inject(TOKENS.IWalletService) private _walletService: IWalletService) {}

    credit = async (req: Request, res: Response) => {
        const { amount, description, referenceId } = req.body
        const userId = req.user?.userId

        if (!userId) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: MSG.UNAUTHORIZED,
            })
            return
        }

        const result = await this._walletService.credit(userId, amount, description, referenceId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MSG.CREDITED,
            data: result,
        })
    }

    debit = async (req: Request, res: Response) => {
        const { amount, description, referenceId } = req.body
        const userId = req.user?.userId

        if (!userId) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: MSG.UNAUTHORIZED,
            })
            return
        }

        const result = await this._walletService.debit(userId, amount, description, referenceId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MSG.DEBITED,
            data: result,
        })
    }

    getWallet = async (req: Request, res: Response) => {
        const userId = req.user?.userId

        if (!userId) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: MSG.UNAUTHORIZED,
            })
            return
        }

        const result = await this._walletService.getWallet(userId)

        if (!result) {
            res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: MSG.NOT_FOUND,
            })
            return
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
        })
    }
}
