import User from '../model/user'
import { IUser } from '../../../interfaces/user.auth'

class UserRepository {
    async createUser(data: Partial<IUser>) {
        return await User.create(data)
    }
}

export const userRepository = new UserRepository()
