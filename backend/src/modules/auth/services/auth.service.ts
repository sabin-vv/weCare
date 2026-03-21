import bcrypt from 'bcrypt'

import { AppError } from '../../../utils/AppError'
import { generateAccessToken, generateRefreshToken } from '../../../utils/jwt'
import { UserRepository } from '../repositories/user.repository'

export class AuthService {
    constructor(private userRepository: UserRepository) {}

    async login(email: string, password: string, role: string) {
        const user = await this.userRepository.findByEmail(email)
        if (!user) {
            throw new AppError(400, 'Invalid credentials')
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            throw new AppError(400, 'Invalid credentials')
        }
        if (role !== user.role) {
            throw new AppError(403, 'Access denied')
        }
        const payload = {
            userId: user._id.toString(),
            role: user.role,
        }

        const accessToken = generateAccessToken(payload)
        const refreshToken = generateRefreshToken(payload)

        return {
            success: true,
            message: 'Login succeesfull',
            user: {
                name: user.name as string,
                email: user.email,
                role: user.role,
            },
            accessToken,
            refreshToken,
        }
    }

    async resetPassword(email: string, password: string) {
        const user = await this.userRepository.findByEmail(email)
        if (!user) {
            throw new AppError(404, 'Email not found')
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        user.password = hashedPassword
        await user.save()
        return {
            success: true,
            message: 'Password changed successfully',
        }
    }
}
