import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IAdminRepository } from '../interfaces/admin.repository.interface'
import { IAdminService } from '../interfaces/admin.service.interface'
import {
    AdminVerificationStatus,
    PendingCaregiversResponse,
    PendingCountResponse,
    PendingDoctorsResponse,
    PlatformSettings,
    RecentCaregiversResponse,
    RecentDoctorsResponse,
    UsersResponse,
} from '../types/admin.types'
import { 
    toPendingDoctorDTO, 
    toRecentDoctorDTO, 
    toPendingCaregiverDTO, 
    toRecentCaregiverDTO, 
    toAdminUserProfileDTO, 
    toPlatformSettingsDTO 
} from '../mapper/admin.mapper'

@injectable()
export class AdminService implements IAdminService {
    constructor(@inject(TOKENS.IAdminRepository) private _adminRepo: IAdminRepository) {}

    async getPendingDoctors(page: number, limit: number, search: string): Promise<PendingDoctorsResponse> {
        const result = await this._adminRepo.getPendingDoctors(page, limit, search)
        return {
            ...result,
            doctors: result.doctors.map(toPendingDoctorDTO)
        }
    }

    async getRecentDoctorVerifications(limit: number): Promise<RecentDoctorsResponse> {
        const result = await this._adminRepo.getRecentDoctorVerifications(limit)
        return {
            ...result,
            doctors: result.doctors.map(toRecentDoctorDTO)
        }
    }

    async verifyDoctor(
        doctorId: string,
        status: AdminVerificationStatus,
        adminId: string,
    ): Promise<{ message: string }> {
        if (status !== 'verified' && status !== 'rejected') {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Invalid verification status')
        }
        return this._adminRepo.verifyDoctor(doctorId, status, adminId)
    }

    async verifySpecialization(
        doctorId: string,
        specIndex: number,
        verified: boolean,
        adminId: string,
    ): Promise<{ message: string }> {
        return this._adminRepo.verifySpecialization(doctorId, specIndex, verified, adminId)
    }

    async getPendingCaregivers(page: number, limit: number, search: string): Promise<PendingCaregiversResponse> {
        const result = await this._adminRepo.getPendingCaregivers(page, limit, search)
        return {
            ...result,
            caregivers: result.caregivers.map(toPendingCaregiverDTO)
        }
    }

    async getRecentCaregiverVerifications(limit: number): Promise<RecentCaregiversResponse> {
        const result = await this._adminRepo.getRecentCaregiverVerifications(limit)
        return {
            ...result,
            caregivers: result.caregivers.map(toRecentCaregiverDTO)
        }
    }

    async verifyCaregiver(
        caregiverId: string,
        status: AdminVerificationStatus,
        adminId: string,
    ): Promise<{ message: string }> {
        if (status !== 'verified' && status !== 'rejected') {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Invalid verification status')
        }
        return this._adminRepo.verifyCaregiver(caregiverId, status, adminId)
    }

    async getPendingCount(): Promise<PendingCountResponse> {
        return this._adminRepo.getPendingCount()
    }

    async getPendingDoctorsCount(): Promise<{ count: number }> {
        const count = await this._adminRepo.getPendingDoctorsCount()
        return { count }
    }

    async getPendingCaregiversCount(): Promise<{ count: number }> {
        const count = await this._adminRepo.getPendingCaregiversCount()
        return { count }
    }

    async getUsers(role: string, search: string, page: number, limit: number): Promise<UsersResponse> {
        const result = await this._adminRepo.getUsers(role, search, page, limit)
        return {
            ...result,
            users: result.users.map(toAdminUserProfileDTO)
        }
    }

    async toggleUserStatus(userId: string, isActive: boolean): Promise<{ message: string }> {
        if (typeof isActive !== 'boolean') {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'isActive must be boolean')
        }
        return this._adminRepo.toggleUserStatus(userId, isActive)
    }

    async getPlatformSettings(): Promise<PlatformSettings> {
        const settings = await this._adminRepo.getPlatformSettings()
        return toPlatformSettingsDTO(settings)
    }

    async updatePlatformSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
        const updated = await this._adminRepo.updatePlatformSettings(settings)
        return toPlatformSettingsDTO(updated)
    }
}
