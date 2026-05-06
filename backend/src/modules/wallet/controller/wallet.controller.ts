import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
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
                message: 'Unauthorized',
            })
            return
        }

        const result = await this._walletService.credit(userId, amount, description, referenceId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Wallet credited successfully',
            data: result,
        })
    }

    debit = async (req: Request, res: Response) => {
        const { amount, description, referenceId } = req.body
        const userId = req.user?.userId

        if (!userId) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Unauthorized',
            })
            return
        }

        const result = await this._walletService.debit(userId, amount, description, referenceId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Wallet debited successfully',
            data: result,
        })
    }

    getWallet = async (req: Request, res: Response) => {
        const userId = req.user?.userId

        if (!userId) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Unauthorized',
            })
            return
        }

        const result = await this._walletService.getWallet(userId)

        if (!result) {
            res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Wallet not found',
            })
            return
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
        })
    }
}
