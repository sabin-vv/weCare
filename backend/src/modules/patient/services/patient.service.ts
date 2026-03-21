import bcrypt from 'bcrypt'

import { Role } from '../../../interfaces/user.auth'
import { AppError } from '../../../utils/AppError'
import { generatePatientId } from '../../../utils/generatePatientId'
import { UserRepository } from '../../auth/repositories/user.repository'
import { PatientRegisterRequest } from '../interfaces/patientInterfaces'
import { PatientRepository } from '../repositories/patient.repository'

export class PatientService {
    constructor(
        private patientRepository: PatientRepository,
        private userRepository: UserRepository,
    ) {}
    async registerPatient(body: PatientRegisterRequest) {
        const { name, email, dateOfBirth, gender, mobile, password, confirmPassword } = body

        const patientExist = await this.patientRepository.findByEmail(email)

        if (patientExist) {
            throw new AppError(400, 'The email ID is already exist')
        }
        if (password !== confirmPassword) {
            throw new AppError(400, 'Password missmatch')
        }

        const formattedMobile = mobile.startsWith('+') ? mobile : `+${mobile}`

        const hashedPassword = await bcrypt.hash(password, 10)

        const patientId = await generatePatientId()

        const user = await this.userRepository.createUser({
            name,
            email,
            mobile: formattedMobile,
            password: hashedPassword,
            role: Role.PATIENT,
            isActive: true,
        })
        const patient = {
            userId: user._id,
            dateOfBirth,
            gender,
            patientId,
        }

        await this.patientRepository.createPatient(patient)

        return {
            success: true,
            message: 'Patient registered successfully',
        }
    }
}
