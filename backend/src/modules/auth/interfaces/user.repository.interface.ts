import { Types } from 'mongoose'

import { UserDocument } from '../types/auth.types'

export interface IUserRepository {
    findByEmail(email: string): Promise<UserDocument | null>

    create(data: Partial<UserDocument>): Promise<UserDocument>

    updatePassword(userId: Types.ObjectId, password: string): Promise<void>
}
