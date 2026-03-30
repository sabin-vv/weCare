import bcrypt from 'bcrypt'

import { UserRole } from '../types/auth.types'

interface UserRegistrationDTO {
    name: string
    email: string
    mobile: string
    password: string
}

export const toUserEntity = async (dto: UserRegistrationDTO, role: UserRole) => {
    return {
        name: dto.name,
        email: dto.email,
        mobile: dto.mobile,
        password: await bcrypt.hash(dto.password, 10),
        role,
    }
}
