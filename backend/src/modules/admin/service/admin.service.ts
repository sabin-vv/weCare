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
    UsersResponse,
} from '../types/admin.types'

@injectable()
export class AdminService implements IAdminService {
    constructor(@inject(TOKENS.IAdminRepository) private adminRepo: IAdminRepository) {}

    async getPendingDoctors(page: number, limit: number, search: string): Promise<PendingDoctorsResponse> {
        return this.adminRepo.getPendingDoctors(page, limit, search)
    }

    async verifyDoctor(
        doctorId: string,
        status: AdminVerificationStatus,
        adminId: string,
    ): Promise<{ message: string }> {
        if (status !== 'verified' && status !== 'rejected') {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Invalid verification status')
        }
        return this.adminRepo.verifyDoctor(doctorId, status, adminId)
    }

    async verifySpecialization(
        doctorId: string,
        specIndex: number,
        verified: boolean,
        adminId: string,
    ): Promise<{ message: string }> {
        return this.adminRepo.verifySpecialization(doctorId, specIndex, verified, adminId)
    }

    async getPendingCaregivers(page: number, limit: number, search: string): Promise<PendingCaregiversResponse> {
        return this.adminRepo.getPendingCaregivers(page, limit, search)
    }

    async verifyCaregiver(
        caregiverId: string,
        status: AdminVerificationStatus,
        adminId: string,
    ): Promise<{ message: string }> {
        if (status !== 'verified' && status !== 'rejected') {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Invalid verification status')
        }
        return this.adminRepo.verifyCaregiver(caregiverId, status, adminId)
    }

    async getPendingCount(): Promise<PendingCountResponse> {
        return this.adminRepo.getPendingCount()
    }

    async getUsers(role: string, search: string, page: number, limit: number): Promise<UsersResponse> {
        return this.adminRepo.getUsers(role, search, page, limit)
    }

    async toggleUserStatus(userId: string, isActive: boolean): Promise<{ message: string }> {
        if (typeof isActive !== 'boolean') {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'isActive must be boolean')
        }
        return this.adminRepo.toggleUserStatus(userId, isActive)
    }
}

