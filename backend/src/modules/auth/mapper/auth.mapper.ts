import bcrypt from 'bcrypt'

import { RegisterDoctorDTO } from '../../doctor/validator/registerDoctor.schema'
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
