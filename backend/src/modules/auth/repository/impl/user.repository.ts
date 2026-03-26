import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../../core/base/base.repository'
import UserModel from '../../../../models/user.model'
import { UserDocument } from '../../../../types/user.model.types'
import { IUserRepository } from '../interface/user.repository.interface'

@injectable()
export class UserRepository extends BaseRepository<UserDocument> implements IUserRepository {
    constructor() {
        super(UserModel)
    }
    async findByEmail(email: string) {
        return this.model.findOne({ email })
    }
}
