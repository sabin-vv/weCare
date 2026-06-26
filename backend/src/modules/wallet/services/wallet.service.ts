import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { MSG } from '../constants/messages'
import { IWalletRepository } from '../interfaces/wallet.repository.interface'
import { IWalletService } from '../interfaces/wallet.service.interface'
import { WalletDocument } from '../types/wallet.types'

@injectable()
export class WalletService implements IWalletService {
    constructor(@inject(TOKENS.IWalletRepository) private _walletRepo: IWalletRepository) {}

    async credit(userId: string, amount: number, description: string, referenceId?: string): Promise<WalletDocument> {
        if (amount <= 0) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.CREDIT_POSITIVE)
        }

        let wallet = await this._walletRepo.findByUserId(userId)
        if (!wallet) {
            wallet = await this._walletRepo.createWallet(userId)
        }

        const transaction = {
            type: 'credit' as const,
            amount,
            referenceId: referenceId ? (referenceId as string) : undefined,
            description,
            createdAt: new Date(),
        }

        const updatedWallet = await this._walletRepo.update(wallet._id.toString(), {
            $inc: { balance: amount },
            $push: { transactions: transaction },
        })

        if (!updatedWallet) {
            throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, MSG.FAILED_CREDIT)
        }

        return updatedWallet
    }

    async debit(
        userId: string,
        amount: number,
        description: string,
        referenceId?: string,
    ): Promise<{ balance: number }> {
        if (amount <= 0) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.DEBIT_POSITIVE)
        }

        const wallet = await this._walletRepo.findByUserId(userId)
        if (!wallet) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.NOT_FOUND)
        }

        if (wallet.balance < amount) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.INSUFFICIENT_BALANCE)
        }

        const transaction = {
            type: 'debit' as const,
            amount,
            referenceId: referenceId ? (referenceId as string) : undefined,
            description,
            createdAt: new Date(),
        }

        const updatedWallet = await this._walletRepo.update(wallet._id.toString(), {
            $inc: { balance: -amount },
            $push: { transactions: transaction },
        })

        if (!updatedWallet) {
            throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, MSG.FAILED_DEBIT)
        }

        return { balance: updatedWallet.balance }
    }

    async getWallet(userId: string) {
        let wallet = await this._walletRepo.findByUserId(userId)
        if (!wallet) {
            wallet = await this._walletRepo.createWallet(userId)
        }

        return {
            balance: wallet.balance,
            transactions: wallet.transactions
                .slice()
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((t) => ({
                    type: t.type,
                    amount: t.amount,
                    description: t.description,
                    createdAt: t.createdAt,
                })),
        }
    }
}
