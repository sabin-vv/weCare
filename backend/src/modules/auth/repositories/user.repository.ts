import { IUser } from '../../../interfaces/user.auth'
import User from '../model/user'

class UserRepository {
    async createUser(data: Partial<IUser>) {
        return await User.create(data)
    }
}

export const userRepository = new UserRepository()
