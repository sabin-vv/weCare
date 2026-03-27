import 'reflect-metadata'

import { container } from 'tsyringe'

import { IUserRepository } from '../modules/auth/interfaces/user.repository.interface'
import { UserRepository } from '../modules/auth/repository/user.repository'
import { AuthService } from '../modules/auth/service/auth.service'
import { IDoctorRepository } from '../modules/doctor/interfaces/doctor.repository.interface'
import { DoctorRepository } from '../modules/doctor/repository/doctor.repository'
import { TOKENS } from './tokens'

container.register<IUserRepository>(TOKENS.IUserRepository, { useClass: UserRepository })
container.register<IDoctorRepository>(TOKENS.IDoctorRepository, { useClass: DoctorRepository })
container.register(TOKENS.IAuthService, { useClass: AuthService })
