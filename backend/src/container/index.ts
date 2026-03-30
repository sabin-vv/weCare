import 'reflect-metadata'

import { container } from 'tsyringe'

import { IAuthService } from '../modules/auth/interfaces/auth.service.interface'
import { IOtpService } from '../modules/auth/interfaces/otp.service.interface'
import { IUserRepository } from '../modules/auth/interfaces/user.repository.interface'
import { UserRepository } from '../modules/auth/repository/user.repository'
import { AuthService } from '../modules/auth/service/auth.service'
import { OtpService } from '../modules/auth/service/otp.service'
import { IDoctorRepository } from '../modules/doctor/interfaces/doctor.repository.interface'
import { IDoctorService } from '../modules/doctor/interfaces/doctor.service.interface'
import { DoctorRepository } from '../modules/doctor/repository/doctor.repository'
import { DoctorService } from '../modules/doctor/service/doctor.service'
import { TOKENS } from './tokens'

container.register<IUserRepository>(TOKENS.IUserRepository, { useClass: UserRepository })
container.register<IDoctorRepository>(TOKENS.IDoctorRepository, { useClass: DoctorRepository })
container.register<IDoctorService>(TOKENS.IDoctorService, { useClass: DoctorService })
container.register<IAuthService>(TOKENS.IAuthService, { useClass: AuthService })
container.register<IOtpService>(TOKENS.IOtpService, { useClass: OtpService })
