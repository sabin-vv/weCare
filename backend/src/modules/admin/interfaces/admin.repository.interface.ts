import {
    AdminVerificationStatus,
    PendingCaregiversResponse,
    PendingCountResponse,
    PendingDoctorsResponse,
    RecentDoctorsResponse,
    UsersResponse,
} from '../types/admin.types'

export interface IAdminRepository {
    getPendingDoctors(page: number, limit: number, search: string): Promise<PendingDoctorsResponse>
    getRecentVerifications(limit: number): Promise<RecentDoctorsResponse>
    verifyDoctor(doctorId: string, status: AdminVerificationStatus, adminId: string): Promise<{ message: string }>
    verifySpecialization(
        doctorId: string,
        specIndex: number,
        verified: boolean,
        adminId: string,
    ): Promise<{ message: string }>
    getPendingCaregivers(page: number, limit: number, search: string): Promise<PendingCaregiversResponse>
    verifyCaregiver(
        caregiverId: string,
        status: AdminVerificationStatus,
        adminId: string,
    ): Promise<{ message: string }>
    getPendingCount(): Promise<PendingCountResponse>
    getUsers(role: string, search: string, page: number, limit: number): Promise<UsersResponse>
    toggleUserStatus(userId: string, isActive: boolean): Promise<{ message: string }>
}

