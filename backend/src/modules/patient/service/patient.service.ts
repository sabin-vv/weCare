import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { MSG } from '../constants/messages'
import { IActivityLogService } from '../../activityLog/interfaces/activityLog.service.interface'
import { IAppointmentRepository } from '../../appointment/interfaces/appointment.repository.interface'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { toUserEntity } from '../../auth/mapper/auth.mapper'
import { UserDocument, UserRole } from '../../auth/types/auth.types'
import { ICaregiverRepository } from '../../caregiver/interfaces/caregiver.repository.interface'
import { CaregiverDocument } from '../../caregiver/types/caregiver.types'
import { IDoctorRepository } from '../../doctor/interfaces/doctor.repository.interface'
import { IFeedbackRepository } from '../../feedback/interfaces/feedback.repository.interface'
import { IMedicationRepository } from '../../medication/interfaces/medication.repository.interface'
import { INotificationService } from '../../notification/interfaces/notification.service.interface'
import { CreateNotificationPayload } from '../../notification/types/notification.types'
import { IPrescriptionRepository } from '../../prescription/interfaces/prescription.repository.interface'
import { IVitalRepository } from '../../vital/interfaces/vital.repository.interface'
import { IPatientRepository } from '../interfaces/patient.repository.interface'
import { IPatientService } from '../interfaces/patient.service.interface'
import {
    toListPatientsMapper,
    toPatientDetailsDTO,
    toPatientEntity,
    toPatientProfileResponseDTO,
    toPatientResponseDTO,
} from '../mapper/patient.mapper'
import {
    CareTeamMemberDTO,
    CareTeamResponseDTO,
    ClinicalStatus,
    ListPatientMapper,
    ListPatientsResponse,
    PatientDetailsDTO,
    PatientDocument,
    PatientEntity,
    PatientProfileResponseDTO,
    PatientResponseDTO,
    RiskLevel,
} from '../types/patient.types'
import { RegisterPatientDTO } from '../validator/patient.schema'
import { UpdatePatientConditionDTO } from '../validator/updatePatientCondition.schema'
import { UpdatePatientSettingsDTO } from '../validator/updatePatientSettings.schema'

const STARTING_ID = 1000
const DOCTOR_PATIENT_APPOINTMENT_FILTERS = ['in_consultation', 'completed'] as const
const DOCTOR_PATIENT_CLINICAL_FILTERS = ['active', 'hospitalized', 'deceased'] as const
const DOCTOR_PATIENT_RISK_LEVEL_FILTERS = ['mild', 'moderate', 'severe', 'high_risk'] as const
const CLINICAL_STATUS_TRANSITION: Record<ClinicalStatus, ClinicalStatus[]> = {
    active: ['hospitalized', 'recovered', 'deceased'],
    hospitalized: ['active', 'recovered', 'deceased'],
    recovered: ['active'],
    deceased: [],
} as const

const CLINICAL_STATUS_UPDATE: Omit<Record<ClinicalStatus, string>, 'active'> = {
    hospitalized: 'Patient Hospitalized',
    recovered: 'Patient Recovered',
    deceased: 'Patient Deceased',
}

@injectable()
export class PatientService implements IPatientService {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
        @inject(TOKENS.IAppointmentRepository) private _appointmentRepo: IAppointmentRepository,
        @inject(TOKENS.IDoctorRepository) private _doctorRepo: IDoctorRepository,
        @inject(TOKENS.ICaregiverRepository) private _caregiverRepo: ICaregiverRepository,
        @inject(TOKENS.IPatientRepository) private _patientRepo: IPatientRepository,
        @inject(TOKENS.IVitalRepository) private _vitalRepo: IVitalRepository,
        @inject(TOKENS.IPrescriptionRepository) private _prescriptionRepo: IPrescriptionRepository,
        @inject(TOKENS.IMedicationRepository) private _medicationRepo: IMedicationRepository,
        @inject(TOKENS.IFeedbackRepository) private _feedbackRepo: IFeedbackRepository,
        @inject(TOKENS.INotificationService) private _notificationService: INotificationService,
        @inject(TOKENS.IActivityLogService) private _activityLogService: IActivityLogService,
    ) {}

    private transitionClinicalStatus(currentStatus: ClinicalStatus, nextStatus: ClinicalStatus): boolean {
        return CLINICAL_STATUS_TRANSITION[currentStatus].includes(nextStatus)
    }

    private async generateNextPatientId(): Promise<string> {
        const lastId = await this._patientRepo.getLastPatientId()
        const nextNumber = lastId ? parseInt(lastId, 10) + 1 : STARTING_ID
        return String(nextNumber)
    }

    private async resolveDoctorPatientContext(doctorId: string, patientId: string) {
        const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(doctorId))
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.DOCTOR_PROFILE_NOT_FOUND)
        }

        const patient = await this._patientRepo.findById(patientId)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PATIENT_NOT_FOUND)
        }

        if (patient.primaryDoctorId?.toString() !== doctor._id.toString()) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, MSG.NOT_AUTHORIZED_TO_VIEW)
        }

        return { doctor, patient }
    }

    private async buildPatientDetails(doctorId: string, patient: PatientDocument) {
        const user = await this._userRepo.findById(patient.userId.toString())
        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.USER_NOT_FOUND)
        }

        const [appointment] = await this._appointmentRepo.findDoctorVisibleAppointmentsByDoctorAndPatientIds(doctorId, [
            patient.userId.toString(),
        ])

        let caregiver: UserDocument | null = null
        if (patient.caregiverId) {
            const caregiverDoc = await this._caregiverRepo.findById(patient.caregiverId.toString())
            if (caregiverDoc) {
                caregiver = await this._userRepo.findById(caregiverDoc.userId.toString())
            }
        }

        const [vitals, prescriptions] = await Promise.all([
            this._vitalRepo.findLatestRecordedSchedulesByPatientId(patient._id),
            this._prescriptionRepo.findByPatientId(patient._id.toString()),
        ])

        return toPatientDetailsDTO(user, patient, appointment, caregiver, vitals, prescriptions)
    }

    private async pausePatientMonitoring(patientId: string, reason: string) {
        await this._vitalRepo.pauseVitalPlanByPatientId(patientId, reason)
        await this._vitalRepo.cancelPendingSchedulesByPatient(patientId, reason)
        await this._medicationRepo.cancelMedicationSchedulesByPatient(patientId, reason)
        await this._prescriptionRepo.pausePrescription(patientId)
    }

    private async completePatientMonitoring(patientId: string, reason: string) {
        await this._vitalRepo.completeVitalPlanByPatientId(patientId)
        await this._vitalRepo.cancelPendingSchedulesByPatient(patientId, reason)
        await this._prescriptionRepo.completePrescription(patientId)
        await this._medicationRepo.cancelMedicationSchedulesByPatient(patientId, reason)
        await this._patientRepo.removeCaregiver(patientId)
    }

    private async cancelPatientWorkFlow(patientId: string, discontinuedBy: string, reason: string) {
        const result = await this._patientRepo.updateById(patientId, { accountStatus: 'archived' })
        if (!result) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.UPDATE_ACCOUNT_STATUS_FAILED)
        }
        await this._prescriptionRepo.discontinuePrescriptionByPatientId(patientId, discontinuedBy)
        await this._medicationRepo.cancelMedicationSchedulesByPatient(patientId, reason)
        await this._vitalRepo.completeVitalPlanByPatientId(patientId)
        await this._vitalRepo.cancelPendingSchedulesByPatient(patientId, reason)
        await this._patientRepo.removeCaregiver(patientId)
    }

    private async resumePatientMonitoring(patientId: string) {
        await this._vitalRepo.resumeVitalPlanByPatientId(patientId)
        await this._prescriptionRepo.resumePrescription(patientId)
    }

    async registerPatient(dto: RegisterPatientDTO): Promise<PatientResponseDTO> {
        const existing = await this._userRepo.findByEmail(dto.email)
        if (existing) throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.USER_ALREADY_EXISTS)

        const userData = await toUserEntity(dto, UserRole.PATIENT)
        const user = await this._userRepo.create(userData)

        const patientId = await this.generateNextPatientId()
        const patientData: PatientEntity = toPatientEntity(user._id, patientId, dto)
        const patient = await this._patientRepo.create(patientData)
        return toPatientResponseDTO(user, patient)
    }

    async getProfile(userId: string): Promise<PatientProfileResponseDTO> {
        const user = await this._userRepo.findById(userId)
        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.USER_NOT_FOUND)
        }

        const patient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PROFILE_NOT_FOUND)
        }

        return toPatientProfileResponseDTO(user, patient)
    }

    async getCareTeam(userId: string): Promise<CareTeamResponseDTO> {
        const patient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PROFILE_NOT_FOUND)
        }

        let doctor: CareTeamMemberDTO | null = null
        if (patient.primaryDoctorId) {
            const doctorDoc = await this._doctorRepo.findById(patient.primaryDoctorId.toString())
            if (doctorDoc) {
                const doctorUser = await this._userRepo.findById(doctorDoc.userId.toString())
                const doctorFeedback = await this._feedbackRepo.findOneByPatientAndTarget(
                    patient._id.toString(),
                    doctorDoc._id.toString(),
                    'doctor',
                )
                doctor = {
                    id: doctorDoc._id.toString(),
                    name: doctorUser ? `Dr. ${doctorUser.name}` : 'Doctor',
                    role: 'doctor',
                    specialization: doctorDoc.specializations?.map((s) => (typeof s === 'string' ? s : s.name)) || [],
                    profileImage: doctorDoc.profileImage,
                    isActive: doctorDoc.isActive,
                    myRating: doctorFeedback?.rating,
                    myComment: doctorFeedback?.comment,
                    email: doctorUser?.email,
                    mobile: doctorUser?.mobile,
                }
            }
        }

        let caregiver: CareTeamMemberDTO | null = null
        if (patient.caregiverId) {
            const caregiverDoc = await this._caregiverRepo.findById(patient.caregiverId.toString())
            if (caregiverDoc) {
                const caregiverUser = await this._userRepo.findById(caregiverDoc.userId.toString())
                const caregiverFeedback = await this._feedbackRepo.findOneByPatientAndTarget(
                    patient._id.toString(),
                    caregiverDoc._id.toString(),
                    'caregiver',
                )
                caregiver = {
                    id: caregiverDoc._id.toString(),
                    name: caregiverUser?.name || 'Caregiver',
                    role: 'caregiver',
                    profileImage: caregiverDoc.profileImage,
                    isActive: caregiverDoc.isActive,
                    myRating: caregiverFeedback?.rating,
                    myComment: caregiverFeedback?.comment,
                    email: caregiverUser?.email,
                    mobile: caregiverUser?.mobile,
                }
            }
        }

        return { doctor, caregiver }
    }

    async updateProfile(userId: string, dto: UpdatePatientSettingsDTO): Promise<PatientProfileResponseDTO> {
        const existingPatient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
        if (!existingPatient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PROFILE_NOT_FOUND)
        }

        const userUpdates: Record<string, string> = {}
        if (dto.name !== undefined) {
            userUpdates.name = dto.name
        }
        if (dto.email !== undefined) {
            userUpdates.email = dto.email
        }
        if (dto.mobile !== undefined) {
            userUpdates.mobile = dto.mobile
        }
        if (Object.keys(userUpdates).length > 0) {
            await this._userRepo.update(userId, userUpdates)
        }

        const patientUpdates = {
            profileImage: dto.profileImage ?? existingPatient.profileImage,
        }

        const patient = await this._patientRepo.updateByUserId(new Types.ObjectId(userId), patientUpdates)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PROFILE_NOT_FOUND)
        }

        const updatedUser = await this._userRepo.findById(userId)
        if (!updatedUser) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.USER_NOT_FOUND)
        }

        return toPatientProfileResponseDTO(updatedUser, patient)
    }

    async listPatients(
        doctorId: string,
        params: {
            search: string
            clinicalStatus: string
            riskLevel: string
            page: number
            limit: number
        },
    ): Promise<ListPatientsResponse> {
        const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(doctorId))
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.DOCTOR_PROFILE_NOT_FOUND)
        }

        const page = Math.max(1, params.page || 1)
        const limit = Math.max(1, params.limit || 8)
        const normalizedClinicalStatus = params.clinicalStatus || 'all'
        const normalizedRiskLevel = params.riskLevel || 'all'
        const normalizedSearch = params.search.trim()

        const matchedPatientUserIds = await this._appointmentRepo.findPatientIdsByStatus(doctor._id.toString(), [
            ...DOCTOR_PATIENT_APPOINTMENT_FILTERS,
        ])
        const appointmentFilteredUserIds = matchedPatientUserIds.map((id) => new Types.ObjectId(id))

        if (appointmentFilteredUserIds && appointmentFilteredUserIds.length === 0) {
            return {
                patients: [],
                pagination: {
                    page,
                    limit,
                    totalCount: 0,
                    totalPages: 1,
                },
            }
        }

        let searchUserIds: Types.ObjectId[] | undefined
        if (normalizedSearch) {
            const matchedUsers = await this._userRepo.findAll({
                name: { $regex: normalizedSearch, $options: 'i' },
            })
            searchUserIds = matchedUsers.map((user) => new Types.ObjectId(user._id.toString()))
        }

        const { data: patients, total } = await this._patientRepo.listPatientsByDoctor({
            search: normalizedSearch,
            page,
            limit,
            primaryDoctorId: doctor._id,
            clinicalStatus: DOCTOR_PATIENT_CLINICAL_FILTERS.includes(
                normalizedClinicalStatus as (typeof DOCTOR_PATIENT_CLINICAL_FILTERS)[number],
            )
                ? (normalizedClinicalStatus as ClinicalStatus)
                : 'all',
            riskLevel: DOCTOR_PATIENT_RISK_LEVEL_FILTERS.includes(
                normalizedRiskLevel as (typeof DOCTOR_PATIENT_RISK_LEVEL_FILTERS)[number],
            )
                ? (normalizedRiskLevel as RiskLevel)
                : 'all',
            searchUserIds,
            userIds: appointmentFilteredUserIds,
        })

        const userIds = patients.map((patient) => patient.userId)
        const caregiverIds = patients.map((p) => p.caregiverId?.toString()).filter((id): id is string => !!id)

        const users = await this._userRepo.findAll({
            _id: { $in: userIds },
        })
        let caregiversMap = new Map<string, UserDocument>()
        if (caregiverIds.length > 0) {
            const caregiverDocs = (
                await Promise.all(caregiverIds.map((id) => this._caregiverRepo.findById(id)))
            ).filter((doc): doc is CaregiverDocument => doc !== null)

            const caregiverUserIds = caregiverDocs.map((doc) => doc.userId.toString())
            const caregiverUsers = await this._userRepo.findAll({
                _id: { $in: caregiverUserIds.map((id) => new Types.ObjectId(id)) },
            })
            const userMap = new Map(caregiverUsers.map((u) => [u._id.toString(), u]))

            caregiversMap = new Map(
                caregiverDocs
                    .map((doc) => {
                        const user = userMap.get(doc.userId.toString())
                        return user ? ([doc._id.toString(), user] as const) : null
                    })
                    .filter((entry): entry is [string, UserDocument] => entry !== null),
            )
        }

        const appointments = await this._appointmentRepo.findDoctorVisibleAppointmentsByDoctorAndPatientIds(
            doctor._id.toString(),
            userIds.map((userId) => userId.toString()),
        )

        const usersMap = new Map(users.map((user) => [user._id.toString(), user]))
        const appointmentsMap = new Map<string, (typeof appointments)[number]>()

        for (const appointment of appointments) {
            const patientId = appointment.patientId.toString()
            if (!appointmentsMap.has(patientId)) {
                appointmentsMap.set(patientId, appointment)
            }
        }

        const mappedPatients = patients
            .map((patient) => {
                const user = usersMap.get(patient.userId.toString())
                if (!user) return null

                const caregiver = patient.caregiverId
                    ? (caregiversMap.get(patient.caregiverId.toString()) ?? null)
                    : null
                return toListPatientsMapper(
                    user,
                    patient,
                    appointmentsMap.get(patient.userId.toString()) ?? null,
                    caregiver,
                )
            })
            .filter((patient): patient is ListPatientMapper => patient !== null)

        return {
            patients: mappedPatients,
            pagination: {
                page,
                limit,
                totalCount: total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        }
    }

    async getPatientById(doctorId: string, patientId: string): Promise<PatientDetailsDTO> {
        const { doctor, patient } = await this.resolveDoctorPatientContext(doctorId, patientId)

        return await this.buildPatientDetails(doctor._id.toString(), patient)
    }

    async updatePatientCondition(
        doctorId: string,
        patientId: string,
        dto: UpdatePatientConditionDTO,
    ): Promise<PatientDetailsDTO> {
        const { doctor } = await this.resolveDoctorPatientContext(doctorId, patientId)

        const patient = await this._patientRepo.updateById(patientId, {
            conditions: dto.conditions,
            riskLevel: dto.riskLevel,
        })

        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PATIENT_NOT_FOUND)
        }

        return await this.buildPatientDetails(doctor._id.toString(), patient)
    }

    async assignCaregiver(doctorId: string, patientId: string, caregiverId: string): Promise<PatientDetailsDTO> {
        const { doctor } = await this.resolveDoctorPatientContext(doctorId, patientId)

        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(caregiverId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.CAREGIVER_NOT_FOUND)
        }

        if (!caregiver.isActive) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.CAREGIVER_NOT_ACTIVE)
        }

        const patient = await this._patientRepo.updateById(patientId, {
            caregiverId: new Types.ObjectId(caregiver._id),
        })

        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PATIENT_NOT_FOUND)
        }

        const caregiverUser = await this._userRepo.findById(caregiver.userId.toString())
        const caregiverName = caregiverUser?.name ?? 'A caregiver'

        const payload: CreateNotificationPayload = {
            recipientId: patient.userId.toString(),
            recipientRole: 'patient',
            type: 'caregiver_assigned',
            title: 'Caregiver Assigned',
            message: `Caregiver ${caregiverName} has been assigned to you.`,
            metadata: { caregiverId: caregiver._id.toString() },
        }
        await this._notificationService.createNotification(payload).catch(() => null)

        const patientUser = await this._userRepo.findById(patient.userId.toString())
        const patientName = patientUser?.name ?? 'A patient'

        const caregiverPayload: CreateNotificationPayload = {
            recipientId: caregiver.userId.toString(),
            recipientRole: 'caregiver',
            type: 'patient_assigned',
            title: 'Patient Assigned',
            message: `You have been assigned to care for ${patientName}.`,
            metadata: { patientId: patient._id.toString() },
        }
        await this._notificationService.createNotification(caregiverPayload).catch(() => null)

        await this._activityLogService.logActivity({
            performedBy: doctorId,
            performedByRole: 'doctor',
            category: 'user_management',
            action: 'caregiver_assigned',
            targetId: caregiver._id.toString(),
            targetType: 'caregiver',
            patientId: patient._id.toString(),
            description: `Caregiver ${caregiverName} assigned to patient ${patientName}`,
        })

        return await this.buildPatientDetails(doctor._id.toString(), patient)
    }

    async updateClinicalStatus(
        doctorId: string,
        patientId: string,
        clinicalStatus: ClinicalStatus,
    ): Promise<PatientDetailsDTO> {
        const { doctor, patient } = await this.resolveDoctorPatientContext(doctorId, patientId)

        if (!patient.clinicalStatus) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.NO_CURRENT_CLINICAL_STATUS)
        }

        if (patient.clinicalStatus === clinicalStatus) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.ALREADY_IN_CLINICAL_STATUS)
        }

        const isAllowed = this.transitionClinicalStatus(patient.clinicalStatus, clinicalStatus)

        if (!isAllowed) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, `Cannot change ${patient.clinicalStatus} to ${clinicalStatus}`)
        }

        switch (`${patient.clinicalStatus}>${clinicalStatus}`) {
            case 'active>hospitalized':
                this.pausePatientMonitoring(patientId, CLINICAL_STATUS_UPDATE.hospitalized)
                break
            case 'active>recovered':
                this.completePatientMonitoring(patientId, CLINICAL_STATUS_UPDATE.recovered)
                break
            case 'active>deceased':
                this.cancelPatientWorkFlow(patientId, doctorId, CLINICAL_STATUS_UPDATE.deceased)
                break
            case 'hospitalized>active':
                this.resumePatientMonitoring(patientId)
                break
            case 'hospitalized>recovered':
                this.completePatientMonitoring(patientId, CLINICAL_STATUS_UPDATE.recovered)
                break
            case 'hospitalized>deceased':
                this.cancelPatientWorkFlow(patientId, doctorId, CLINICAL_STATUS_UPDATE.deceased)
                break
            case 'recovered>active':
                break
        }

        const updatedPatient = await this._patientRepo.updateById(patientId, { clinicalStatus })
        if (!updatedPatient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PATIENT_NOT_FOUND)
        }

        return await this.buildPatientDetails(doctor._id.toString(), updatedPatient)
    }
}
