import { Document, Types } from 'mongoose'

export interface WalletTransaction {
    type: 'credit' | 'debit'
    amount: number
    referenceId?: Types.ObjectId
    description: string
    createdAt: Date
}

export interface WalletDocument extends Document {
    userId: Types.ObjectId
    balance: number
    transactions: WalletTransaction[]
}
