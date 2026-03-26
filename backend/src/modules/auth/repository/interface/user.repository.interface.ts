import { UserDocument } from '../../../../types/user.model.types'

export interface IUserRepository {
    findByEmail(email: string): Promise<UserDocument | null>
    create(data: Partial<UserDocument>): Promise<UserDocument>
}
