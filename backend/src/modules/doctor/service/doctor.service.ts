import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IAppointmentRepository } from '../../appointment/interfaces/appointment.repository.interface'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { IDoctorRepository } from '../interfaces/doctor.repository.interface'
import { IDoctorService } from '../interfaces/doctor.service.interface'
import { IDoctorAvailabilityRepository } from '../interfaces/doctor-availability.repository.interface'
import { toDoctorEntity, toDoctorProfileResponse } from '../mapper/doctor.mapper'
import { toDoctorSlotsResponse } from '../mapper/doctorSlots.mapper'
import {
    DoctorAvailability,
    DoctorAvailabilityDocument,
    DoctorDocument,
    DoctorProfileResponse,
    DoctorSearchFilter,
    DoctorSearchResponse,
    DoctorSearchResult,
    DoctorSlotsResponse,
    PopulatedDoctorDocument,
    WeekDay,
} from '../types/doctor.types'
import { DoctorDTO } from '../validator/registerDoctor.schema'
import { UpdateDoctorAvailabilityDTO } from '../validator/updateDoctorAvailability.schema'
import { UpdateDoctorSettingsDTO } from '../validator/updateDoctorSettings.schema'

const weekDays: WeekDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const defaultAvailability: DoctorAvailability = {
    timezone: 'UTC',
    weeklySchedule: weekDays.map((day) => ({ day, isAvailable: false, timeRanges: [] })),
    slotDuration: 15,
    startDate: '',
    endDate: '',
}

const formatDate = (date?: Date) => {
    if (!date) {
        return ''
    }

    return date.toISOString().split('T')[0]
}

const parseDate = (date: string) => {
    if (!date) {
        return undefined
    }

    return new Date(`${date}T00:00:00.000Z`)
}

const normalizeAvailability = (
    availability?: DoctorAvailability | DoctorAvailabilityDocument | null,
): DoctorAvailability => ({
    timezone: availability?.timezone || defaultAvailability.timezone,
    weeklySchedule: weekDays.map((day) => {
        const savedSchedule = availability?.weeklySchedule?.find((schedule) => schedule.day === day)

        return savedSchedule
            ? {
                  day,
                  isAvailable: savedSchedule.isAvailable,
                  timeRanges: savedSchedule.timeRanges.map((range) => ({ ...range })),
              }
            : { day, isAvailable: false, timeRanges: [] }
    }),
    slotDuration: availability?.slotDuration || defaultAvailability.slotDuration,
    startDate:
        availability?.startDate instanceof Date ? formatDate(availability.startDate) : availability?.startDate || '',
    endDate: availability?.endDate instanceof Date ? formatDate(availability.endDate) : availability?.endDate || '',
})

@injectable()
export class DoctorService implements IDoctorService {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
        @inject(TOKENS.IDoctorRepository) private _doctorRepo: IDoctorRepository,
        @inject(TOKENS.IDoctorAvailabilityRepository)
        private _doctorAvailabilityRepo: IDoctorAvailabilityRepository,
        @inject(TOKENS.IAppointmentRepository) private _appointmentRepo: IAppointmentRepository,
    ) {}

    async createProfile(userId: string, dto: DoctorDTO) {
        const existingDoctor = await this._doctorRepo.findByUserId(new Types.ObjectId(userId))
        if (existingDoctor) {
            throw new AppError(HTTP_STATUS.CONFLICT, 'Doctor profile already exists')
        }

        const doctorData = toDoctorEntity(new Types.ObjectId(userId), dto)

        await this._doctorRepo.create(doctorData)
        await this._userRepo.update(userId, { isProfileComplete: true })
    }

    async getProfile(userId: string): Promise<DoctorProfileResponse> {
        const user = await this._userRepo.findById(userId)
        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(userId))
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor profile not found')
        }

        return toDoctorProfileResponse(user, doctor)
    }

    async getDoctorById(doctorId: string): Promise<DoctorProfileResponse> {
        const doctor = await this._doctorRepo.findById(doctorId)
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor not found')
        }

        const user = await this._userRepo.findById(doctor.userId.toString())
        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        return toDoctorProfileResponse(user, doctor)
    }

    async updateProfile(userId: string, dto: UpdateDoctorSettingsDTO): Promise<DoctorProfileResponse> {
        const existingDoctor = await this._doctorRepo.findByUserId(new Types.ObjectId(userId))
        if (!existingDoctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor profile not found')
        }

        const userUpdates: Record<string, string> = {}
        if (dto.fullName !== undefined) {
            userUpdates.name = dto.fullName
        }
        if (dto.email !== undefined) {
            userUpdates.email = dto.email
        }
        if (dto.phoneNumber !== undefined) {
            userUpdates.mobile = dto.phoneNumber
        }
        if (Object.keys(userUpdates).length > 0) {
            await this._userRepo.update(userId, userUpdates)
        }

        const hasVerificationResubmission =
            dto.govIdImage !== undefined ||
            dto.medicalCertificateNumber !== undefined ||
            dto.medicalCertificateImage !== undefined ||
            dto.medicalCouncilRegisterNumber !== undefined ||
            dto.medicalCouncilImage !== undefined ||
            dto.specializations !== undefined ||
            dto.specializationDocumentKeys !== undefined

        const doctorUpdates: Partial<DoctorDocument> = {
            consultationFee: dto.consultationFee ?? existingDoctor.consultationFee,
            isActive: dto.isActive !== undefined ? dto.isActive : existingDoctor.isActive,
            profileImage: dto.profileImage ?? existingDoctor.profileImage,
            govIdImage: dto.govIdImage ?? existingDoctor.govIdImage,
            medicalCertificateNumber: dto.medicalCertificateNumber ?? existingDoctor.medicalCertificateNumber,
            medicalCertificateImage: dto.medicalCertificateImage ?? existingDoctor.medicalCertificateImage,
            medicalCouncilRegisterNumber:
                dto.medicalCouncilRegisterNumber ?? existingDoctor.medicalCouncilRegisterNumber,
            medicalCouncilImage: dto.medicalCouncilImage ?? existingDoctor.medicalCouncilImage,
        }

        if (dto.specializations && dto.specializationDocumentKeys) {
            doctorUpdates.specializations = dto.specializations.map((spec, index) => ({
                name: spec.name,
                documentImage: dto.specializationDocumentKeys?.[index] ?? '',
            }))
        }

        if (hasVerificationResubmission) {
            doctorUpdates.verificationStatus = 'pending'
            doctorUpdates.rejectReason = ''
        }

        const doctor = await this._doctorRepo.updateByUserId(new Types.ObjectId(userId), doctorUpdates)

        const updatedUser = await this._userRepo.findById(userId)
        if (!updatedUser) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        return toDoctorProfileResponse(updatedUser, doctor)
    }

    async getAvailability(userId: string): Promise<DoctorAvailability> {
        const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(userId))
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor profile not found')
        }

        const availability = await this._doctorAvailabilityRepo.findByDoctorId(doctor._id as Types.ObjectId)

        return normalizeAvailability(availability)
    }

    async updateAvailability(userId: string, dto: UpdateDoctorAvailabilityDTO): Promise<DoctorAvailability> {
        const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(userId))
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor profile not found')
        }

        const availability = await this._doctorAvailabilityRepo.createOrUpdateByDoctorId(doctor._id as Types.ObjectId, {
            timezone: dto.timezone,
            weeklySchedule: dto.weeklySchedule,
            slotDuration: dto.slotDuration,
            startDate: parseDate(dto.startDate),
            endDate: parseDate(dto.endDate),
        })

        return normalizeAvailability(availability)
    }

    async searchDoctors(params: {
        search?: string
        specialty?: string
        page: number
        limit: number
    }): Promise<DoctorSearchResponse> {
        const page = params.page || 1
        const limit = params.limit || 8
        const filter: DoctorSearchFilter = { isActive: true, verificationStatus: 'verified' }

        if (params.specialty) {
            filter['specializations.name'] = params.specialty
        }

        if (params.search) {
            filter.$or = [
                { 'specializations.name': { $regex: params.search, $options: 'i' } },
                { 'userId.name': { $regex: params.search, $options: 'i' } },
            ]
        }

        const { doctors, total } = await this._doctorRepo.search(filter, {
            page,
            limit,
        })

        const mappedDoctors = doctors.map((doc: PopulatedDoctorDocument): DoctorSearchResult => {
            const user = doc.userId
            return {
                id: doc._id.toString(),
                name: user?.name || 'Unknown Doctor',
                specialty: doc.specializations.map((s) => s.name).join(', '),
                profileImage: doc.profileImage,
            }
        })

        const specialties = await this.getSpecialties()
        const totalPages = Math.ceil(total / limit)

        return { doctors: mappedDoctors, specialties, totalCount: total, totalPages, currentPage: page }
    }

    async getSpecialties(): Promise<string[]> {
        return this._doctorRepo.getSpecialties()
    }

    async getDoctorSlots(doctorId: string, date: string): Promise<DoctorSlotsResponse> {
        const doctor = await this._doctorRepo.findById(doctorId)
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor not found')
        }

        const availability = await this._doctorAvailabilityRepo.findByDoctorId(doctor._id as Types.ObjectId)
        const appointments = await this._appointmentRepo.findActiveAppointments(doctor._id.toString(), date)

        return toDoctorSlotsResponse(doctorId, date, availability, appointments)
    }
}
