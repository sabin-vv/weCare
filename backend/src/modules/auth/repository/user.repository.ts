import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IUserRepository } from '../interfaces/user.repository.interface'
import { UserModel } from '../models/user.model'
import { UserDocument } from '../types/auth.types'

@injectable()
export class UserRepository extends BaseRepository<UserDocument> implements IUserRepository {
    constructor() {
        super(UserModel)
    }
    async findByEmail(email: string) {
        return this.model.findOne({ email })
    }
}
