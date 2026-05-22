import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IAppointmentRepository } from '../../appointment/interfaces/appointment.repository.interface'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { toUserEntity } from '../../auth/mapper/auth.mapper'
import { UserDocument, UserRole } from '../../auth/types/auth.types'
import { ICaregiverRepository } from '../../caregiver/interfaces/caregiver.repository.interface'
import { IDoctorRepository } from '../../doctor/interfaces/doctor.repository.interface'
import { IPrescriptionRepository } from '../../prescription/interfaces/prescription.repository.interface'
import { IVitalRepository } from '../../vital/interfaces/vital.repository.interface'
import { IPatientRepository } from '../interfaces/patient.repository.interface'
import { IPatientService } from '../interfaces/patient.service.interface'
import {
    type PatientResponseDTO,
    toListPatientsMapper,
    toPatientDetailsDTO,
    toPatientEntity,
    toPatientProfileResponseDTO,
    toPatientResponseDTO,
} from '../mapper/patient.mapper'
import { ListPatientMapper, ListPatientsResponse, PatientProfileResponseDTO } from '../types/patient.types'
import { RegisterPatientDTO } from '../validator/patient.schema'
import { UpdatePatientConditionDTO } from '../validator/updatePatientCondition.schema'
import { UpdatePatientSettingsDTO } from '../validator/updatePatientSettings.schema'

const STARTING_ID = 1000
const DOCTOR_PATIENT_APPOINTMENT_FILTERS = ['confirmed', 'in_consultation', 'completed'] as const

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
    ) {}

    private async generateNextPatientId(): Promise<string> {
        const lastId = await this._patientRepo.getLastPatientId()
        const nextNumber = lastId ? parseInt(lastId, 10) + 1 : STARTING_ID
        return String(nextNumber)
    }

    private async resolveDoctorPatientContext(doctorId: string, patientId: string) {
        const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(doctorId))
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor profile not found')
        }

        const patient = await this._patientRepo.findById(patientId)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient not found')
        }

        if (patient.primaryDoctorId?.toString() !== doctor._id.toString()) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'You are not authorized to view this patient')
        }

        return { doctor, patient }
    }

    private async buildPatientDetails(doctorId: string, patient: import('../types/patient.types').PatientDocument) {
        const user = await this._userRepo.findById(patient.userId.toString())
        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        const appointment = await this._appointmentRepo.findDoctorVisibleCurrentAppointment(
            doctorId,
            patient.userId.toString(),
        )

        let caregiver: import('../../auth/types/auth.types').UserDocument | null = null
        if (patient.caregiverId) {
            caregiver = await this._userRepo.findById(patient.caregiverId.toString())
        }

        const [vitals, prescriptions] = await Promise.all([
            this._vitalRepo.findByPatientId(patient._id.toString()),
            this._prescriptionRepo.findByPatientId(patient._id.toString()),
        ])

        return toPatientDetailsDTO(user, patient, appointment, caregiver, vitals, prescriptions)
    }

    async registerPatient(dto: RegisterPatientDTO): Promise<PatientResponseDTO> {
        const existing = await this._userRepo.findByEmail(dto.email)
        if (existing) throw new AppError(HTTP_STATUS.BAD_REQUEST, 'User already exist')

        const userData = await toUserEntity(dto, UserRole.PATIENT)
        const user = await this._userRepo.create(userData)

        const patientId = await this.generateNextPatientId()
        const patientData = toPatientEntity(user._id, patientId, dto)
        const patient = await this._patientRepo.create(patientData)
        return toPatientResponseDTO(user, patient)
    }

    async getProfile(userId: string): Promise<PatientProfileResponseDTO> {
        const user = await this._userRepo.findById(userId)
        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        const patient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient profile not found')
        }

        return toPatientProfileResponseDTO(user, patient)
    }

    async updateProfile(userId: string, dto: UpdatePatientSettingsDTO): Promise<PatientProfileResponseDTO> {
        const existingPatient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
        if (!existingPatient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient profile not found')
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
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient profile not found')
        }

        const updatedUser = await this._userRepo.findById(userId)
        if (!updatedUser) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        return toPatientProfileResponseDTO(updatedUser, patient)
    }
    async listPatients(
        doctorId: string,
        params: { search: string; filter: string; page: number; limit: number },
    ): Promise<ListPatientsResponse> {
        const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(doctorId))
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor profile not found')
        }

        const page = Math.max(1, params.page || 1)
        const limit = Math.max(1, params.limit || 8)
        const normalizedFilter = params.filter || 'all'
        const normalizedSearch = params.search.trim()

        let appointmentFilteredUserIds: Types.ObjectId[] | undefined

        if (normalizedFilter === 'all') {
            const matchedPatientUserIds = await this._appointmentRepo.findPatientIdsByStatus(
                doctor._id.toString(),
                [...DOCTOR_PATIENT_APPOINTMENT_FILTERS],
            )
            appointmentFilteredUserIds = matchedPatientUserIds.map((id) => new Types.ObjectId(id))
        } else if (DOCTOR_PATIENT_APPOINTMENT_FILTERS.includes(normalizedFilter as (typeof DOCTOR_PATIENT_APPOINTMENT_FILTERS)[number])) {
            const matchedPatientUserIds = await this._appointmentRepo.findPatientIdsByStatus(doctor._id.toString(), [
                normalizedFilter,
            ])
            appointmentFilteredUserIds = matchedPatientUserIds.map((id) => new Types.ObjectId(id))
        }

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
            ...params,
            search: normalizedSearch,
            page,
            limit,
            searchUserIds,
            userIds: appointmentFilteredUserIds,
        })

        const userIds = patients.map((patient) => patient.userId)
        const caregiverIds = patients.map((p) => p.caregiverId?.toString()).filter((id): id is string => !!id)

        const users = await this._userRepo.findAll({
            _id: { $in: userIds },
        })

        let caregivers: UserDocument[] = []
        if (caregiverIds.length > 0) {
            caregivers = await this._userRepo.findAll({ _id: { $in: caregiverIds } })
        }

        const caregiversMap = new Map(caregivers.map((c) => [c._id.toString(), c]))

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

    async getPatientById(
        doctorId: string,
        patientId: string,
    ): Promise<import('../types/patient.types').PatientDetailsDTO> {
        const { doctor, patient } = await this.resolveDoctorPatientContext(doctorId, patientId)
        return await this.buildPatientDetails(doctor._id.toString(), patient)
    }

    async updatePatientCondition(
        doctorId: string,
        patientId: string,
        dto: UpdatePatientConditionDTO,
    ): Promise<import('../types/patient.types').PatientDetailsDTO> {
        const { doctor } = await this.resolveDoctorPatientContext(doctorId, patientId)

        const patient = await this._patientRepo.updateById(patientId, {
            conditions: dto.conditions,
            riskLevel: dto.riskLevel,
        })

        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient not found')
        }

        return await this.buildPatientDetails(doctor._id.toString(), patient)
    }

    async assignCaregiver(
        doctorId: string,
        patientId: string,
        caregiverId: string,
    ): Promise<import('../types/patient.types').PatientDetailsDTO> {
        const { doctor } = await this.resolveDoctorPatientContext(doctorId, patientId)

        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(caregiverId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver not found')
        }

        if (!caregiver.isActive) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Caregiver is not active')
        }

        const patient = await this._patientRepo.updateById(patientId, {
            caregiverId: new Types.ObjectId(caregiverId),
        })

        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient not found')
        }

        return await this.buildPatientDetails(doctor._id.toString(), patient)
    }
}
