import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IActivityLogService } from '../../activityLog/interfaces/activityLog.service.interface'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { IAdminRepository } from '../interfaces/admin.repository.interface'
import { IAdminService } from '../interfaces/admin.service.interface'
import {
    toAdminUserProfileDTO,
    toPendingCaregiverDTO,
    toPendingDoctorDTO,
    toPlatformSettingsDTO,
    toRecentCaregiverDTO,
    toRecentDoctorDTO,
} from '../mapper/admin.mapper'
import {
    AdminAppointmentsResponseDTO,
    AdminVerificationStatus,
    DashboardChartData,
    PendingCaregiversResponse,
    PendingCountResponse,
    PendingDoctorsResponse,
    PlatformSettings,
    RecentCaregiversResponse,
    RecentDoctorsResponse,
    UsersResponse,
} from '../types/admin.types'

@injectable()
export class AdminService implements IAdminService {
    constructor(
        @inject(TOKENS.IAdminRepository) private _adminRepo: IAdminRepository,
        @inject(TOKENS.IActivityLogService) private _activityLogService: IActivityLogService,
        @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
    ) {}

    async getPendingDoctors(page: number, limit: number, search: string): Promise<PendingDoctorsResponse> {
        const result = await this._adminRepo.getPendingDoctors(page, limit, search)
        return {
            ...result,
            doctors: result.doctors.map(toPendingDoctorDTO),
        }
    }

    async getRecentDoctorVerifications(limit: number): Promise<RecentDoctorsResponse> {
        const result = await this._adminRepo.getRecentDoctorVerifications(limit)
        return {
            ...result,
            doctors: result.doctors.map(toRecentDoctorDTO),
        }
    }

    async verifyDoctor(
        doctorId: string,
        status: AdminVerificationStatus,
        adminId: string,
        reason?: string,
    ): Promise<{ message: string }> {
        if (status !== 'verified' && status !== 'rejected') {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Invalid verification status')
        }

        const user = await this._userRepo.findById(doctorId)
        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor not found')
        }
        const result = await this._adminRepo.verifyDoctor(doctorId, status, adminId, reason)
        await this._activityLogService.logActivity({
            performedBy: adminId,
            performedByRole: 'admin',
            category: 'verification',
            action: status === 'verified' ? 'doctor_verified' : 'doctor_rejected',
            targetId: doctorId,
            targetType: 'doctor',
            description:
                status === 'verified'
                    ? `Dr. ${user.name} Verification Approved`
                    : `Dr. ${user.name} Verification Rejected`,
        })
        return result
    }

    async verifySpecialization(
        doctorId: string,
        specIndex: number,
        verified: boolean,
    ): Promise<{ message: string }> {
        return this._adminRepo.verifySpecialization(doctorId, specIndex, verified)
    }

    async getPendingCaregivers(page: number, limit: number, search: string): Promise<PendingCaregiversResponse> {
        const result = await this._adminRepo.getPendingCaregivers(page, limit, search)
        return {
            ...result,
            caregivers: result.caregivers.map(toPendingCaregiverDTO),
        }
    }

    async getRecentCaregiverVerifications(limit: number): Promise<RecentCaregiversResponse> {
        const result = await this._adminRepo.getRecentCaregiverVerifications(limit)
        return {
            ...result,
            caregivers: result.caregivers.map(toRecentCaregiverDTO),
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
        const result = await this._adminRepo.verifyCaregiver(caregiverId, status, adminId)
        const user = await this._userRepo.findById(caregiverId)
        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver not found')
        }
        await this._activityLogService.logActivity({
            performedBy: adminId,
            performedByRole: 'admin',
            category: 'verification',
            action: status === 'verified' ? 'caregiver_verified' : 'caregiver_rejected',
            targetId: caregiverId,
            targetType: 'caregiver',
            description:
                status === 'verified'
                    ? `Caregiver ${user.name} Verification Approved`
                    : `Caregiver ${user.name} Verification Rejected`,
        })
        return result
    }

    async getDashboardChartData(limit?: number, startDate?: string, endDate?: string): Promise<DashboardChartData> {
        return this._adminRepo.getDashboardChartData(limit, startDate, endDate)
    }

    async getAdminAppointments(
        page: number,
        limit: number,
        search?: string,
        status?: string,
        startDate?: string,
        endDate?: string,
    ): Promise<AdminAppointmentsResponseDTO> {
        return this._adminRepo.getAdminAppointments(page, limit, search, status, startDate, endDate)
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
            users: result.users.map(toAdminUserProfileDTO),
        }
    }

    async toggleUserStatus(userId: string, isActive: boolean): Promise<{ message: string }> {
        if (typeof isActive !== 'boolean') {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'isActive must be boolean')
        }

        const result = await this._adminRepo.toggleUserStatus(userId, isActive)
        const user = await this._userRepo.findById(userId)
        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }
        await this._activityLogService.logActivity({
            performedByRole: 'admin',
            category: 'user_management',
            action: isActive ? 'user_enabled' : 'user_disabled',
            targetId: userId,
            targetType: 'user',
            description: `${user.role} ${user.name}'s account is ${isActive ? 'enabled' : 'disabled'}`,
        })
        return result
    }

    async getPlatformSettings(): Promise<PlatformSettings> {
        const settings = await this._adminRepo.getPlatformSettings()
        return toPlatformSettingsDTO(settings)
    }

    async updatePlatformSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
        const updated = await this._adminRepo.updatePlatformSettings(settings)
        await this._activityLogService.logActivity({
            performedByRole: 'admin',
            category: 'platform_settings',
            action: 'settings_updated',
            targetType: 'platform_setting',
            description: 'Platform settings updated',
        })
        return toPlatformSettingsDTO(updated)
    }
}
