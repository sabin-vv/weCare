import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { IMedicationRepository } from '../../medication/interfaces/medication.repository.interface'
import { MedicationScheduleDTO } from '../../medication/types/medication.type'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'
import { IVitalRepository } from '../../vital/interfaces/vital.repository.interface'
import { VitalPlanItem } from '../../vital/types/vital.types'
import { ICaregiverRepository, PatientSummary } from '../interfaces/caregiver.repository.interface'
import { ICaregiverService } from '../interfaces/caregiver.service.interface'
import {
    toCaregiverEntity,
    toCaregiverProfileEntity,
    toCaregiverProfileResponse,
    toCaregiverProfileResponseFromAggregation,
} from '../mapper/caregiver.mapper'
import { CaregiverProfileResponse } from '../types/caregiver.types'
import { CreateCaregiverProfileDTO } from '../validator/caregiver.schema'
import { UpdateCaregiverSettingsDTO } from '../validator/updateCaregiverSettings.schema'

@injectable()
export class CaregiverService implements ICaregiverService {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
        @inject(TOKENS.ICaregiverRepository) private _caregiverRepo: ICaregiverRepository,
        @inject(TOKENS.IPatientRepository) private _patientRepo: IPatientRepository,
        @inject(TOKENS.IMedicationRepository) private _medicationRepo: IMedicationRepository,
        @inject(TOKENS.IVitalRepository) private _vitalRepo: IVitalRepository,
    ) {}

    async createProfile(userId: string, dto: CreateCaregiverProfileDTO): Promise<Partial<CaregiverProfileResponse>> {
        const existingCaregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (existingCaregiver) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Caregiver profile already exists')
        }

        const caregiverData = toCaregiverEntity(new Types.ObjectId(userId), dto, {})
        const caregiver = await this._caregiverRepo.create(caregiverData)
        await this._userRepo.update(userId, { isProfileComplete: true })

        return toCaregiverProfileEntity(caregiver)
    }

    async getProfile(userId: string): Promise<CaregiverProfileResponse> {
        const user = await this._userRepo.findById(userId)
        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver profile not found')
        }

        return toCaregiverProfileResponse(user, caregiver)
    }

    async updateProfile(userId: string, dto: UpdateCaregiverSettingsDTO): Promise<CaregiverProfileResponse> {
        const existingCaregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!existingCaregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver profile not found')
        }

        await this._userRepo.update(userId, {
            name: dto.fullName,
            email: dto.email,
            mobile: dto.phoneNumber,
        })

        const caregiver = await this._caregiverRepo.updateByUserId(new Types.ObjectId(userId), {
            phoneNumber: dto.phoneNumber,
            isActive: dto.isActive !== undefined ? dto.isActive : existingCaregiver.isActive,
            profileImage: dto.profileImage || existingCaregiver.profileImage,
        })
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver profile not found')
        }

        const updatedUser = await this._userRepo.findById(userId)
        if (!updatedUser) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        return toCaregiverProfileResponse(updatedUser, caregiver)
    }

    async listCaregivers(search?: string): Promise<CaregiverProfileResponse[]> {
        const caregivers = await this._caregiverRepo.findAllActive(search)

        return caregivers.map(toCaregiverProfileResponseFromAggregation)
    }

    async getPatientMedications(caregiverId: Types.ObjectId, patientId: string): Promise<MedicationScheduleDTO[]> {
        const caregiver = await this._caregiverRepo.findById(caregiverId.toString())

        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver not found')
        }

        const patient = await this._patientRepo.findById(patientId)

        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient not found')
        }

        if (patient.caregiverId?.toString() !== caregiver.userId.toString()) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'You are not assigned to this patient')
        }

        const schedules = await this._medicationRepo.findByPatientAndCaregiver(patient._id)

        return schedules.map((schedule) => ({
            _id: schedule._id.toString(),
            medicineName: schedule.medicineName,
            dosage: schedule.dosage,
            route: schedule.route,
            scheduleTime: schedule.scheduleTime.toISOString(),
            priority: schedule.priority,
            status: schedule.status,
            administeredAt: schedule.administeredAt?.toISOString(),
        }))
    }

    async getPatientVitalPlans(caregiverId: Types.ObjectId, patientId: string): Promise<VitalPlanItem[]> {
        const caregiver = await this._caregiverRepo.findById(caregiverId.toString())
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver not found')
        }

        const patient = await this._patientRepo.findById(patientId)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient not found')
        }

        if (patient.caregiverId?.toString() !== caregiver.userId.toString()) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'You are not assigned to this patient')
        }

        const plans = await this._vitalRepo.findVitalPlansByPatientIdAndStatus(patient._id.toString(), 'active')
        const items: VitalPlanItem[] = []
        for (const plan of plans) {
            items.push(...plan.vitals)
        }
        return items
    }

    async getMyPatients(caregiverId: Types.ObjectId): Promise<PatientSummary[]> {
        return await this._caregiverRepo.findPatientsByCaregiver(caregiverId)
    }
}
