import { WalletDocument } from '../types/wallet.types'

export interface IWalletService {
    credit(userId: string, amount: number, description: string, referenceId?: string): Promise<WalletDocument>

    debit(userId: string, amount: number, description: string, referenceId?: string): Promise<{ balance: number }>

    getWallet(userId: string): Promise<{
        balance: number
        transactions: Array<{ type: string; amount: number; description: string; createdAt: Date }>
    } | null>
}
