import bcrypt from 'bcrypt'

import { RegisterDoctorDTO } from '../dto/registerDoctor.dto'
import { UserRole } from '../types/auth.types'

export const toUserEntity = async (dto: RegisterDoctorDTO) => {
    return {
        name: dto.name,
        email: dto.email,
        mobile: dto.mobile,
        password: await bcrypt.hash(dto.password, 10),
        role: UserRole.DOCTOR,
    }
}
