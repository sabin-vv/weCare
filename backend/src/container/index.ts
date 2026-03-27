import 'reflect-metadata'

import { container } from 'tsyringe'

import { IUserRepository } from '../modules/auth/interfaces/user.repository.interface'
import { UserRepository } from '../modules/auth/repository/user.repository'
import { IDoctorRepository } from '../modules/doctor/interfaces/doctor.repository.interface'
import { DoctorRepository } from '../modules/doctor/repository/doctor.repository'

container.register<IUserRepository>('IUserRepository', { useClass: UserRepository })
container.register<IDoctorRepository>('IDoctorRepository', { useClass: DoctorRepository })
