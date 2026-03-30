import 'reflect-metadata'

import { container } from 'tsyringe'

import { IAdminRepository } from '../modules/admin/interfaces/admin.repository.interface'
import { IAdminService } from '../modules/admin/interfaces/admin.service.interface'
import { AdminRepository } from '../modules/admin/repository/admin.repository'
import { AdminService } from '../modules/admin/service/admin.service'
import { IAuthService } from '../modules/auth/interfaces/auth.service.interface'
import { IOtpService } from '../modules/auth/interfaces/otp.service.interface'
import { IUserRepository } from '../modules/auth/interfaces/user.repository.interface'
import { UserRepository } from '../modules/auth/repository/user.repository'
import { AuthService } from '../modules/auth/service/auth.service'
import { OtpService } from '../modules/auth/service/otp.service'
import { ICaregiverRepository } from '../modules/caregiver/interfaces/caregiver.repository.interface'
import { ICaregiverService } from '../modules/caregiver/interfaces/caregiver.service.interface'
import { CaregiverRepository } from '../modules/caregiver/repository/caregiver.repository'
import { CaregiverService } from '../modules/caregiver/service/caregiver.service'
import { IDoctorRepository } from '../modules/doctor/interfaces/doctor.repository.interface'
import { IDoctorService } from '../modules/doctor/interfaces/doctor.service.interface'
import { DoctorRepository } from '../modules/doctor/repository/doctor.repository'
import { DoctorService } from '../modules/doctor/service/doctor.service'
import { IPatientRepository } from '../modules/patient/interfaces/patient.repository.interface'
import { IPatientService } from '../modules/patient/interfaces/patient.service.interface'
import { PatientRepository } from '../modules/patient/repository/patient.repository'
import { PatientService } from '../modules/patient/service/patient.service'
import { TOKENS } from './tokens'

container.register<IUserRepository>(TOKENS.IUserRepository, { useClass: UserRepository })
container.register<IDoctorRepository>(TOKENS.IDoctorRepository, { useClass: DoctorRepository })
container.register<IDoctorService>(TOKENS.IDoctorService, { useClass: DoctorService })
container.register<ICaregiverRepository>(TOKENS.ICaregiverRepository, { useClass: CaregiverRepository })
container.register<ICaregiverService>(TOKENS.ICaregiverService, { useClass: CaregiverService })
container.register<IPatientRepository>(TOKENS.IPatientRepository, { useClass: PatientRepository })
container.register<IPatientService>(TOKENS.IPatientService, { useClass: PatientService })
container.register<IAuthService>(TOKENS.IAuthService, { useClass: AuthService })
container.register<IOtpService>(TOKENS.IOtpService, { useClass: OtpService })
container.register<IAdminRepository>(TOKENS.IAdminRepository, { useClass: AdminRepository })
container.register<IAdminService>(TOKENS.IAdminService, { useClass: AdminService })
