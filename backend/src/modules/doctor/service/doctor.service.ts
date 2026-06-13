import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IAppointmentRepository } from '../../appointment/interfaces/appointment.repository.interface'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { INotificationService } from '../../notification/interfaces/notification.service.interface'
import { CreateNotificationPayload } from '../../notification/types/notification.types'
import { IPaymentRepository } from '../../payment/interfaces/payment.repository.interface'
import { IAvailabilityNotificationService } from '../interfaces/availabilityNotification.service.interface'
import { IDoctorRepository } from '../interfaces/doctor.repository.interface'
import { IDoctorService } from '../interfaces/doctor.service.interface'
import { IDoctorAvailabilityRepository } from '../interfaces/doctor-availability.repository.interface'
import {
    toAvailabilityCancellationNotificationPayload,
    toNotificationFailures,
} from '../mapper/availabilityConflict.mapper'
import { toDoctorEntity, toDoctorProfileResponse } from '../mapper/doctor.mapper'
import { toDoctorSlotsResponse } from '../mapper/doctorSlots.mapper'
import {
    CancelledAppointmentSummary,
    DoctorAvailability,
    DoctorAvailabilityDocument,
    DoctorDocument,
    DoctorProfileResponse,
    DoctorSearchFilter,
    DoctorSearchResponse,
    DoctorSearchResult,
    DoctorSlotsResponse,
    NotificationFailure,
    PopulatedDoctorDocument,
    UpdateDoctorAvailabilityResult,
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
        @inject(TOKENS.IPaymentRepository) private _paymentRepo: IPaymentRepository,
        @inject(TOKENS.IAvailabilityNotificationService)
        private _availabilityNotificationService: IAvailabilityNotificationService,
        @inject(TOKENS.INotificationService)
        private _notificationService: INotificationService,
    ) {}

    async createProfile(userId: string, dto: DoctorDTO) {
        const existingDoctor = await this._doctorRepo.findByUserId(new Types.ObjectId(userId))
        if (existingDoctor) {
            throw new AppError(HTTP_STATUS.CONFLICT, 'Doctor profile already exists')
        }

        const doctorData = toDoctorEntity(new Types.ObjectId(userId), dto)

        await this._doctorRepo.create(doctorData)
        await this._userRepo.update(userId, { isProfileComplete: true })

        const user = await this._userRepo.findById(userId)
        const admins = await this._userRepo.findAll({ role: 'admin' })

        for (const admin of admins) {
            const payload: CreateNotificationPayload = {
                recipientId: admin._id.toString(),
                recipientRole: 'admin',
                type: 'doctor_verification_request',
                title: 'New Doctor Verification Request',
                message: `Doctor ${user?.name ?? 'Unknown'} has submitted their profile for verification.`,
                metadata: { doctorId: userId },
            }
            await this._notificationService.createNotification(payload).catch(() => null)
        }
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

    async updateAvailability(
        userId: string,
        dto: UpdateDoctorAvailabilityDTO,
    ): Promise<UpdateDoctorAvailabilityResult> {
        const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(userId))
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor profile not found')
        }

        const doctorUser = await this._userRepo.findById(userId)
        if (!doctorUser) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        const futureAppointments = await this._appointmentRepo.findFutureCancellableAppointments(
            doctor._id.toString(),
            new Date(),
        )
        const conflictingAppointments = futureAppointments.filter((appointment) =>
            this._isAppointmentOutsideAvailability(
                dto,
                appointment.appointmentDate,
                appointment.slotStart,
                appointment.slotEnd,
            ),
        )

        const availability = await this._doctorAvailabilityRepo.createOrUpdateByDoctorId(doctor._id as Types.ObjectId, {
            timezone: dto.timezone,
            weeklySchedule: dto.weeklySchedule,
            slotDuration: dto.slotDuration,
            startDate: parseDate(dto.startDate),
            endDate: parseDate(dto.endDate),
        })

        const cancelledAppointments: CancelledAppointmentSummary[] = []
        const notificationFailures: NotificationFailure[] = []

        for (const appointment of conflictingAppointments) {
            await this._appointmentRepo.update(appointment._id.toString(), { status: 'cancelled' })

            const payment = this._getPopulatedPayment(appointment.paymentId)
            const refundPending = payment?.status === 'success'

            if (refundPending && payment?._id) {
                await this._paymentRepo.updateById(payment._id.toString(), { status: 'refund_pending' })
            }

            const payload = toAvailabilityCancellationNotificationPayload(appointment, doctorUser.name)

            if (payload) {
                payload.refundPending = refundPending

                const failures = await this._availabilityNotificationService.sendAvailabilityCancellation(payload)
                notificationFailures.push(...toNotificationFailures(appointment._id.toString(), failures))

                cancelledAppointments.push({
                    appointmentId: appointment._id.toString(),
                    patientName: payload.patientName,
                    patientEmail: payload.patientEmail,
                    appointmentDate: payload.appointmentDate,
                    slotStart: payload.slotStart,
                    slotEnd: payload.slotEnd,
                    refundPending,
                })
            }
        }

        return {
            availability: normalizeAvailability(availability),
            cancelledCount: cancelledAppointments.length,
            cancelledAppointments,
            notificationFailures,
        }
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
        const selectedSlot = new Date(date)

        if (availability?.startDate && selectedSlot < availability.startDate) {
            availability.weeklySchedule = []
        }
        if (availability?.endDate && selectedSlot > availability.endDate) {
            availability.weeklySchedule = []
        }

        const appointments = await this._appointmentRepo.findActiveAppointments(doctor._id.toString(), date)

        return toDoctorSlotsResponse(doctorId, date, availability, appointments)
    }

    private _isAppointmentOutsideAvailability(
        availability: UpdateDoctorAvailabilityDTO,
        appointmentDate: Date,
        slotStart: string,
        slotEnd: string,
    ): boolean {
        const appointmentDateString = appointmentDate.toISOString().split('T')[0]

        if (availability.startDate && appointmentDateString < availability.startDate) {
            return true
        }

        if (availability.endDate && appointmentDateString > availability.endDate) {
            return true
        }

        const dayOfWeek = new Date(appointmentDate)
            .toLocaleDateString('en-US', { weekday: 'long' })
            .toLowerCase() as WeekDay

        const schedule = availability.weeklySchedule.find((day) => day.day === dayOfWeek)
        if (!schedule || !schedule.isAvailable) {
            return true
        }

        const isWithinTimeRange = schedule.timeRanges.some(
            (range) => range.startTime <= slotStart && range.endTime >= slotEnd,
        )

        return !isWithinTimeRange
    }

    private _getPopulatedPayment(payment: unknown) {
        if (typeof payment !== 'object' || payment === null || !('_id' in payment)) {
            return undefined
        }

        return payment as {
            _id: string | Types.ObjectId
            status?: 'pending' | 'success' | 'failed' | 'refund_pending' | 'refunded'
        }
    }
}
