import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IAppointmentRepository } from '../../appointment/interfaces/appointment.repository.interface'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { toUserEntity } from '../../auth/mapper/auth.mapper'
import { UserRole } from '../../auth/types/auth.types'
import { IDoctorRepository } from '../../doctor/interfaces/doctor.repository.interface'
import { IPatientRepository } from '../interfaces/patient.repository.interface'
import { IPatientService } from '../interfaces/patient.service.interface'
import {
    type PatientResponseDTO,
    toListPatientsMapper,
    toPatientEntity,
    toPatientProfileResponseDTO,
    toPatientResponseDTO,
} from '../mapper/patient.mapper'
import { ListPatientMapper, ListPatientsResponse, PatientProfileResponseDTO } from '../types/patient.types'
import { RegisterPatientDTO } from '../validator/patient.schema'
import { UpdatePatientSettingsDTO } from '../validator/updatePatientSettings.schema'

const STARTING_ID = 1000

@injectable()
export class PatientService implements IPatientService {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
        @inject(TOKENS.IAppointmentRepository) private _appointmentRepo: IAppointmentRepository,
        @inject(TOKENS.IDoctorRepository) private _doctorRepo: IDoctorRepository,
        @inject(TOKENS.IPatientRepository) private _patientRepo: IPatientRepository,
    ) {}

    private async generateNextPatientId(): Promise<string> {
        const lastId = await this._patientRepo.getLastPatientId()
        const nextNumber = lastId ? parseInt(lastId, 10) + 1 : STARTING_ID
        return String(nextNumber)
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
        const pendingPatientIds =
            normalizedFilter === 'pending_consultation'
                ? await this._appointmentRepo.findPendingPatientIdsByDoctor(doctor._id.toString())
                : null

        if (normalizedFilter === 'pending_consultation' && pendingPatientIds && pendingPatientIds.length === 0) {
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

        const pendingUserIds = pendingPatientIds?.map((patientId) => new Types.ObjectId(patientId)) ?? undefined

        const { data: patients, total } = await this._patientRepo.listPatientsByDoctor(doctor._id as Types.ObjectId, {
            ...params,
            filter: normalizedFilter === 'pending_consultation' ? 'all' : normalizedFilter,
            page,
            limit,
            userIds: pendingUserIds,
        })

        const userIds = patients.map((patient) => patient.userId)
        const users = await this._userRepo.findAll({
            _id: { $in: userIds },
        })

        const appointments = await this._appointmentRepo.findCurrentAppointmentsByDoctorAndPatientIds(
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

                return toListPatientsMapper(user, patient, appointmentsMap.get(patient.userId.toString()) ?? null, null)
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
}
