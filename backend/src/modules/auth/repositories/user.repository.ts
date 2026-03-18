import { User as user } from '../../../interfaces/user.auth'
import User from '../model/user'

export class UserRepository {
    async createUser(data: Partial<user>) {
        return await User.create(data)
    }
    async findByEmail(email: string) {
        return await User.findOne({ email })
    }
}
