import 'reflect-metadata'

import { container } from 'tsyringe'

import { UserRepository } from '../modules/auth/repository/impl/user.repository'
import { IUserRepository } from '../modules/auth/repository/interface/user.repository.interface'
import { DoctorRepository } from '../modules/doctor/repository/impl/doctor.repository'
import { IDoctorRepository } from '../modules/doctor/repository/interface/doctor.repository.interface'

container.register<IUserRepository>('IUserRepository', { useClass: UserRepository })
container.register<IDoctorRepository>('IDoctorRepository', { useClass: DoctorRepository })
