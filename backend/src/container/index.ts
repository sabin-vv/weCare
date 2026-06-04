import 'reflect-metadata'

import { container } from 'tsyringe'

import { IAdminRepository } from '../modules/admin/interfaces/admin.repository.interface'
import { IAdminService } from '../modules/admin/interfaces/admin.service.interface'
import { AdminRepository } from '../modules/admin/repository/admin.repository'
import { AdminService } from '../modules/admin/service/admin.service'
import { IAppointmentRepository } from '../modules/appointment/interfaces/appointment.repository.interface'
import { IAppointmentService } from '../modules/appointment/interfaces/appointment.service.interface'
import { AppointmentRepository } from '../modules/appointment/repository/appointment.repository'
import { AppointmentService } from '../modules/appointment/service/appointment.service'
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
import { IAvailabilityNotificationService } from '../modules/doctor/interfaces/availabilityNotification.service.interface'
import { IDoctorRepository } from '../modules/doctor/interfaces/doctor.repository.interface'
import { IDoctorService } from '../modules/doctor/interfaces/doctor.service.interface'
import { IDoctorAvailabilityRepository } from '../modules/doctor/interfaces/doctor-availability.repository.interface'
import { DoctorRepository } from '../modules/doctor/repository/doctor.repository'
import { DoctorAvailabilityRepository } from '../modules/doctor/repository/doctorAvailability.repository'
import { AvailabilityNotificationService } from '../modules/doctor/service/availabilityNotification.service'
import { DoctorService } from '../modules/doctor/service/doctor.service'
import { IMedicationRepository } from '../modules/medication/interfaces/medication.repository.interface'
import { IMedicationService } from '../modules/medication/interfaces/medication.service.interface'
import { IMedicationLogRepository } from '../modules/medication/interfaces/medicationLog.repository.interface'
import { IMedicationLogService } from '../modules/medication/interfaces/medicationLog.service.interface'
import { MedicationRepository } from '../modules/medication/repository/medication.repository'
import { MedicationLogRepository } from '../modules/medication/repository/medicationLog.repository'
import { MedicationService } from '../modules/medication/service/medication.service'
import { MedicationLogService } from '../modules/medication/service/medicationLog.service'
import { IPatientRepository } from '../modules/patient/interfaces/patient.repository.interface'
import { IPatientService } from '../modules/patient/interfaces/patient.service.interface'
import { PatientRepository } from '../modules/patient/repository/patient.repository'
import { PatientService } from '../modules/patient/service/patient.service'
import { IPaymentRepository } from '../modules/payment/interfaces/payment.repository.interface'
import { IPaymentService } from '../modules/payment/interfaces/payment.service.interface'
import { PaymentRepository } from '../modules/payment/repository/payment.repository'
import { PaymentService } from '../modules/payment/services/payment.service'
import { IPrescriptionRepository } from '../modules/prescription/interfaces/prescription.repository.interface'
import { IPrescriptionService } from '../modules/prescription/interfaces/prescription.service.interface'
import { PrescriptionRepository } from '../modules/prescription/repository/prescription.repository'
import { PrescriptionService } from '../modules/prescription/service/prescription.service'
import { IAlertRepository } from '../modules/alert/interfaces/alert.repository.interface'
import { IAlertService } from '../modules/alert/interfaces/alert.service.interface'
import { AlertRepository } from '../modules/alert/repository/alert.repository'
import { AlertService } from '../modules/alert/service/alert.service'
import { IReminderRepository } from '../modules/reminder/interfaces/reminder.repository.interface'
import { IReminderService } from '../modules/reminder/interfaces/reminder.service.interface'
import { ReminderRepository } from '../modules/reminder/repository/reminder.repository'
import { ReminderService } from '../modules/reminder/service/reminder.service'
import { ISubscriptionRepository } from '../modules/subscription/interfaces/subscription.repository.interface'
import { ISubscriptionService } from '../modules/subscription/interfaces/subscription.service.interface'
import { SubscriptionRepository } from '../modules/subscription/repository/subscription.repository'
import { SubscriptionService } from '../modules/subscription/service/subscription.service'
import { ISymptomLogRepository } from '../modules/symptom/interfaces/symptomLog.repository.interface'
import { ISymptomLogService } from '../modules/symptom/interfaces/symptomLog.service.interface'
import { SymptomLogRepository } from '../modules/symptom/repository/symptomLog.repository'
import { SymptomLogService } from '../modules/symptom/service/symptomLog.service'
import { IVitalRepository } from '../modules/vital/interfaces/vital.repository.interface'
import { IVitalService } from '../modules/vital/interfaces/vital.service.interface'
import { VitalRepository } from '../modules/vital/repository/vital.repository'
import { VitalService } from '../modules/vital/service/vital.service'
import { IWalletRepository } from '../modules/wallet/interfaces/wallet.repository.interface'
import { IWalletService } from '../modules/wallet/interfaces/wallet.service.interface'
import { WalletRepository } from '../modules/wallet/repository/wallet.repository'
import { WalletService } from '../modules/wallet/services/wallet.service'
import { TOKENS } from './tokens'

container.register<IUserRepository>(TOKENS.IUserRepository, { useClass: UserRepository })

container.register<IDoctorRepository>(TOKENS.IDoctorRepository, { useClass: DoctorRepository })
container.register<IDoctorService>(TOKENS.IDoctorService, { useClass: DoctorService })
container.register<IDoctorAvailabilityRepository>(TOKENS.IDoctorAvailabilityRepository, {
    useClass: DoctorAvailabilityRepository,
})
container.register<IAvailabilityNotificationService>(TOKENS.IAvailabilityNotificationService, {
    useClass: AvailabilityNotificationService,
})
container.register<ICaregiverRepository>(TOKENS.ICaregiverRepository, { useClass: CaregiverRepository })
container.register<ICaregiverService>(TOKENS.ICaregiverService, { useClass: CaregiverService })

container.register<IPatientRepository>(TOKENS.IPatientRepository, { useClass: PatientRepository })
container.register<IPatientService>(TOKENS.IPatientService, { useClass: PatientService })

container.register<IAuthService>(TOKENS.IAuthService, { useClass: AuthService })
container.register<IOtpService>(TOKENS.IOtpService, { useClass: OtpService })

container.register<IAdminRepository>(TOKENS.IAdminRepository, { useClass: AdminRepository })
container.register<IAdminService>(TOKENS.IAdminService, { useClass: AdminService })

container.register<IAppointmentService>(TOKENS.IAppointmentService, { useClass: AppointmentService })
container.register<IAppointmentRepository>(TOKENS.IAppointmentRepository, { useClass: AppointmentRepository })

container.register<IPaymentRepository>(TOKENS.IPaymentRepository, { useClass: PaymentRepository })
container.register<IPaymentService>(TOKENS.IPaymentService, { useClass: PaymentService })

container.register<IPrescriptionRepository>(TOKENS.IPrescriptionRepository, { useClass: PrescriptionRepository })
container.register<IPrescriptionService>(TOKENS.IPrescriptionService, { useClass: PrescriptionService })

container.register<IVitalRepository>(TOKENS.IVitalRepository, { useClass: VitalRepository })
container.register<IVitalService>(TOKENS.IVitalService, { useClass: VitalService })

container.register<IWalletRepository>(TOKENS.IWalletRepository, { useClass: WalletRepository })
container.register<IWalletService>(TOKENS.IWalletService, { useClass: WalletService })

container.register<IMedicationRepository>(TOKENS.IMedicationRepository, { useClass: MedicationRepository })
container.register<IMedicationService>(TOKENS.IMedicationService, { useClass: MedicationService })

container.register<IMedicationLogRepository>(TOKENS.IMedicationLogRepository, {
    useClass: MedicationLogRepository,
})
container.register<IMedicationLogService>(TOKENS.IMedicationLogService, { useClass: MedicationLogService })

container.register<ISymptomLogRepository>(TOKENS.ISymptomLogRepository, {
    useClass: SymptomLogRepository,
})
container.register<ISymptomLogService>(TOKENS.ISymptomLogService, { useClass: SymptomLogService })

container.register<ISubscriptionRepository>(TOKENS.ISubscriptionRepository, { useClass: SubscriptionRepository })
container.register<ISubscriptionService>(TOKENS.ISubscriptionService, { useClass: SubscriptionService })

container.register<IAlertRepository>(TOKENS.IAlertRepository, { useClass: AlertRepository })
container.register<IAlertService>(TOKENS.IAlertService, { useClass: AlertService })

container.register<IReminderRepository>(TOKENS.IReminderRepository, { useClass: ReminderRepository })
container.register<IReminderService>(TOKENS.IReminderService, { useClass: ReminderService })
