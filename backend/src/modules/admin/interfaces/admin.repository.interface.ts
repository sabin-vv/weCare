import {
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

export interface IAdminRepository {
    getDashboardChartData(limit?: number, startDate?: string, endDate?: string): Promise<DashboardChartData>
    findByUserId(userId: string): Promise<{ profileImage?: string } | null>

    getPendingDoctors(page: number, limit: number, search: string): Promise<PendingDoctorsResponse>

    getRecentDoctorVerifications(limit: number): Promise<RecentDoctorsResponse>

    verifyDoctor(doctorId: string, status: AdminVerificationStatus, adminId: string, reason?: string): Promise<{ message: string }>

    verifySpecialization(
        doctorId: string,
        specIndex: number,
        verified: boolean,
    ): Promise<{ message: string }>

    getPendingCaregivers(page: number, limit: number, search: string): Promise<PendingCaregiversResponse>

    getRecentCaregiverVerifications(limit: number): Promise<RecentCaregiversResponse>

    verifyCaregiver(caregiverId: string, status: AdminVerificationStatus, adminId: string): Promise<{ message: string }>

    getPendingCount(): Promise<PendingCountResponse>

    getPendingDoctorsCount(): Promise<number>

    getPendingCaregiversCount(): Promise<number>

    getUsers(role: string, search: string, page: number, limit: number): Promise<UsersResponse>

    toggleUserStatus(userId: string, isActive: boolean): Promise<{ message: string }>

    getPlatformSettings(): Promise<PlatformSettings>

    updatePlatformSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings>
}
