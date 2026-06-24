import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { AppointmentModel } from '../../appointment/models/appointment.model'
import { UserModel } from '../../auth/models/user.model'
import { UserRole } from '../../auth/types/auth.types'
import { CaregiverModel } from '../../caregiver/models/caregiver.model'
import { VerificationStatus } from '../../caregiver/types/caregiver.types'
import { DoctorModel } from '../../doctor/models/doctor.model'
import { PatientModel } from '../../patient/models/patient.model'
import { PaymentModel } from '../../payment/models/payment.model'
import { IAdminRepository } from '../interfaces/admin.repository.interface'
import { platFoemSettingsModel } from '../models/platformSettings.model'
import {
    AdminUserProfile,
    AdminVerificationStatus,
    AppointmentStats,
    DashboardChartData,
    PendingCaregiver,
    PendingCaregiversResponse,
    PendingCountResponse,
    PendingDoctor,
    PendingDoctorsResponse,
    PendingVerificationUser,
    PlatformSettings,
    RecentCaregiver,
    RecentCaregiversResponse,
    RecentDoctor,
    RecentDoctorsResponse,
    RevenueStats,
    UsersResponse,
} from '../types/admin.types'
import { escapeRegExp } from '../utils/escapeRegExp'

@injectable()
export class AdminRepository implements IAdminRepository {
    async getPendingDoctors(page: number, limit: number, search: string): Promise<PendingDoctorsResponse> {
        const pageSafe = Math.max(1, page)
        const limitSafe = Math.max(1, limit)
        const skip = (pageSafe - 1) * limitSafe

        const searchTrimmed = search?.trim() ?? ''
        const searchOr: Record<string, unknown>[] = []

        const maybeId = Types.ObjectId.isValid(searchTrimmed) ? new Types.ObjectId(searchTrimmed) : null

        if (searchTrimmed) {
            const regex = new RegExp(escapeRegExp(searchTrimmed), 'i')
            searchOr.push({ 'user.name': regex })
            searchOr.push({ 'user.email': regex })
            if (maybeId) searchOr.push({ 'user._id': maybeId })
        }

        const doctorsAggregation = await DoctorModel.aggregate([
            { $match: { verificationStatus: 'pending' } },
            {
                $lookup: {
                    from: UserModel.collection.name,
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            ...(searchOr.length ? [{ $match: { $or: searchOr } }] : []),
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limitSafe },
                        {
                            $project: {
                                _id: { $toString: '$_id' },
                                name: '$user.name',
                                email: '$user.email',
                                profileImage: '$profileImage',
                                medicalCouncilRegisterNumber: '$medicalCouncilRegisterNumber',
                                medicalCertificateNumber: '$medicalCertificateNumber',
                                medicalCouncilImage: '$medicalCouncilImage',
                                medicalCertificateImage: '$medicalCertificateImage',
                                govIdImage: '$govIdImage',
                                specializations: '$specializations',
                                createdAt: { $toString: '$createdAt' },
                            },
                        },
                    ],
                    pagination: [{ $count: 'totalCount' }],
                },
            },
        ])

        const facet = doctorsAggregation[0]
        const doctors = (facet?.data ?? []) as PendingDoctor[]
        const totalCount = facet?.pagination?.[0]?.totalCount ?? 0
        const totalPages = Math.max(1, Math.ceil(totalCount / limitSafe))

        return {
            success: true,
            doctors,
            pagination: { page: pageSafe, limit: limitSafe, totalCount, totalPages },
        }
    }

    async getRecentDoctorVerifications(limit: number): Promise<RecentDoctorsResponse> {
        const limitSafe = Math.max(1, Math.min(limit, 50))

        const aggregation = await DoctorModel.aggregate([
            { $match: { verificationStatus: { $in: ['verified', 'rejected'] } } },
            {
                $lookup: {
                    from: UserModel.collection.name,
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            { $sort: { verifiedAt: -1 } },
            { $limit: limitSafe },
            {
                $project: {
                    _id: { $toString: '$_id' },
                    name: '$user.name',
                    email: '$user.email',
                    profileImage: '$profileImage',
                    medicalCouncilRegisterNumber: '$medicalCouncilRegisterNumber',
                    medicalCertificateNumber: '$medicalCertificateNumber',
                    medicalCouncilImage: '$medicalCouncilImage',
                    medicalCertificateImage: '$medicalCertificateImage',
                    govIdImage: '$govIdImage',
                    specializations: '$specializations',
                    createdAt: { $toString: '$createdAt' },
                    updatedAt: { $toString: '$verifiedAt' },
                    verificationStatus: 1,
                },
            },
        ])

        const doctors = aggregation as RecentDoctor[]

        return {
            success: true,
            doctors,
            pagination: { page: 1, limit: limitSafe, totalCount: doctors.length, totalPages: 1 },
        }
    }

    async verifyDoctor(
        doctorId: string,
        status: AdminVerificationStatus,
        adminId: string,
        reason?: string,
    ): Promise<{ message: string }> {
        const doctor = await DoctorModel.findById(doctorId)
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor not found')
        }

        doctor.verificationStatus = status
        doctor.verifiedBy = new Types.ObjectId(adminId)
        doctor.verifiedAt = new Date()
        doctor.rejectReason = status === 'rejected' ? reason || 'Rejected by admin' : ''
        await doctor.save()

        return {
            message: status === 'verified' ? 'Doctor approved successfully' : 'Doctor rejected successfully',
        }
    }

    async verifySpecialization(
        doctorId: string,
        specIndex: number,
        verified: boolean,
    ): Promise<{ message: string }> {
        const doctor = await DoctorModel.findById(doctorId)
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor not found')
        }

        if (!Number.isInteger(specIndex) || specIndex < 0 || specIndex >= doctor.specializations.length) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Invalid specialization index')
        }

        doctor.specializations[specIndex].verified = verified
        await doctor.save()

        return { message: verified ? 'Specialization verified successfully' : 'Specialization verification removed' }
    }

    async getPendingCaregivers(page: number, limit: number, search: string): Promise<PendingCaregiversResponse> {
        const pageSafe = Math.max(1, page)
        const limitSafe = Math.max(1, limit)
        const skip = (pageSafe - 1) * limitSafe

        const searchTrimmed = search?.trim() ?? ''
        const searchOr: Record<string, unknown>[] = []

        const maybeId = Types.ObjectId.isValid(searchTrimmed) ? new Types.ObjectId(searchTrimmed) : null

        if (searchTrimmed) {
            const regex = new RegExp(escapeRegExp(searchTrimmed), 'i')
            searchOr.push({ 'user.name': regex })
            searchOr.push({ 'user.email': regex })
            if (maybeId) searchOr.push({ 'user._id': maybeId })
        }

        const caregiversAggregation = await CaregiverModel.aggregate([
            { $match: { verificationStatus: 'pending' } },
            {
                $lookup: {
                    from: UserModel.collection.name,
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            ...(searchOr.length ? [{ $match: { $or: searchOr } }] : []),
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limitSafe },
                        {
                            $project: {
                                _id: { $toString: '$_id' },
                                name: '$user.name',
                                email: '$user.email',
                                profileImage: '$profileImage',
                                certificateNumber: '$certificateNumber',
                                licenseNumber: '$licenseNumber',
                                certificateImage: '$certificateImage',
                                licenseImage: '$licenseImage',
                                govIdImage: '$govIdImage',
                                createdAt: { $toString: '$createdAt' },
                            },
                        },
                    ],
                    pagination: [{ $count: 'totalCount' }],
                },
            },
        ])

        const facet = caregiversAggregation[0]
        const caregivers = (facet?.data ?? []) as PendingCaregiver[]
        const totalCount = facet?.pagination?.[0]?.totalCount ?? 0
        const totalPages = Math.max(1, Math.ceil(totalCount / limitSafe))

        return {
            success: true,
            caregivers,
            pagination: { page: pageSafe, limit: limitSafe, totalCount, totalPages },
        }
    }

    async getRecentCaregiverVerifications(limit: number): Promise<RecentCaregiversResponse> {
        const limitSafe = Math.max(1, Math.min(limit, 50))

        const aggregation = await CaregiverModel.aggregate([
            { $match: { verificationStatus: { $in: ['verified', 'rejected'] } } },
            {
                $lookup: {
                    from: UserModel.collection.name,
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            { $sort: { verifiedAt: -1 } },
            { $limit: limitSafe },
            {
                $project: {
                    _id: { $toString: '$_id' },
                    name: '$user.name',
                    email: '$user.email',
                    profileImage: '$profileImage',
                    certificateNumber: '$certificateNumber',
                    licenseNumber: '$licenseNumber',
                    certificateImage: '$certificateImage',
                    licenseImage: '$licenseImage',
                    govIdImage: '$govIdImage',
                    createdAt: { $toString: '$createdAt' },
                    updatedAt: { $toString: '$verifiedAt' },
                    verificationStatus: 1,
                },
            },
        ])

        const caregivers = aggregation as RecentCaregiver[]

        return {
            success: true,
            caregivers,
            pagination: { page: 1, limit: limitSafe, totalCount: caregivers.length, totalPages: 1 },
        }
    }

    async verifyCaregiver(
        caregiverId: string,
        status: AdminVerificationStatus,
        adminId: string,
    ): Promise<{ message: string }> {
        const caregiver = await CaregiverModel.findById(caregiverId)
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver not found')
        }

        caregiver.verificationStatus = status as VerificationStatus
        caregiver.verifiedBy = new Types.ObjectId(adminId)
        caregiver.verifiedAt = new Date()
        caregiver.rejectReason = status === 'rejected' ? 'Rejected by admin' : ''
        caregiver.isActive = status === 'verified'
        await caregiver.save()

        return {
            message: status === 'verified' ? 'Caregiver approved successfully' : 'Caregiver rejected successfully',
        }
    }

    async getPendingCount(): Promise<PendingCountResponse> {
        const [pendingDoctors, pendingCaregivers] = await Promise.all([
            DoctorModel.countDocuments({ verificationStatus: 'pending' }),
            CaregiverModel.countDocuments({ verificationStatus: 'pending' }),
        ])

        return { count: pendingDoctors + pendingCaregivers }
    }

    async getPendingDoctorsCount(): Promise<number> {
        return DoctorModel.countDocuments({ verificationStatus: 'pending' })
    }

    async getPendingCaregiversCount(): Promise<number> {
        return CaregiverModel.countDocuments({ verificationStatus: 'pending' })
    }

    async getUsers(role: string, search: string, page: number, limit: number): Promise<UsersResponse> {
        const pageSafe = Math.max(1, page)
        const limitSafe = Math.max(1, limit)
        const skip = (pageSafe - 1) * limitSafe

        const searchTrimmed = search?.trim() ?? ''
        const searchOr: Record<string, unknown>[] = []

        const match: Record<string, unknown> = {}
        if (role === 'all') {
            match.role = { $in: [UserRole.DOCTOR, UserRole.CAREGIVER, UserRole.PATIENT] }
        } else {
            match.role = role
        }

        const maybeId = Types.ObjectId.isValid(searchTrimmed) ? new Types.ObjectId(searchTrimmed) : null
        if (searchTrimmed) {
            const regex = new RegExp(escapeRegExp(searchTrimmed), 'i')
            searchOr.push({ name: regex })
            searchOr.push({ email: regex })
            if (maybeId) searchOr.push({ _id: maybeId })
        }

        const userAggregation = await UserModel.aggregate([
            ...(Object.keys(match).length ? [{ $match: match }] : []),
            ...(searchOr.length ? [{ $match: { $or: searchOr } }] : []),
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limitSafe },
                        {
                            $lookup: {
                                from: DoctorModel.collection.name,
                                localField: '_id',
                                foreignField: 'userId',
                                as: 'doctorProfile',
                            },
                        },
                        {
                            $lookup: {
                                from: CaregiverModel.collection.name,
                                localField: '_id',
                                foreignField: 'userId',
                                as: 'caregiverProfile',
                            },
                        },
                        {
                            $lookup: {
                                from: PatientModel.collection.name,
                                localField: '_id',
                                foreignField: 'userId',
                                as: 'patientProfile',
                            },
                        },
                        {
                            $addFields: {
                                profileImage: {
                                    $ifNull: [
                                        { $arrayElemAt: ['$doctorProfile.profileImage', 0] },
                                        {
                                            $ifNull: [
                                                { $arrayElemAt: ['$caregiverProfile.profileImage', 0] },
                                                { $arrayElemAt: ['$patientProfile.profileImage', 0] },
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: { $toString: '$_id' },
                                name: 1,
                                email: 1,
                                role: 1,
                                isActive: 1,
                                createdAt: { $toString: '$createdAt' },
                                profileImage: 1,
                            },
                        },
                    ],
                    pagination: [{ $count: 'totalCount' }],
                },
            },
        ])

        const facet = userAggregation[0]
        const users = (facet?.data ?? []) as AdminUserProfile[]
        const totalCount = facet?.pagination?.[0]?.totalCount ?? 0
        const totalPages = Math.max(1, Math.ceil(totalCount / limitSafe))

        return {
            users,
            pagination: { page: pageSafe, limit: limitSafe, totalCount, totalPages },
        }
    }

    async toggleUserStatus(userId: string, isActive: boolean): Promise<{ message: string }> {
        const updated = await UserModel.findByIdAndUpdate(userId, { isActive }, { returnDocument: 'after' })
        if (!updated) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        return { message: `User ${isActive ? 'enabled' : 'blocked'} successfully` }
    }

    async getPlatformSettings(): Promise<PlatformSettings> {
        let settings = await platFoemSettingsModel.findOne()
        if (!settings) {
            settings = await platFoemSettingsModel.create({
                platformName: 'WeCare',
                contactEmail: 'admin@wecare.com',
                address: '',
                platformFee: 0,
                platformLogo: '',
                platformIcon: '',
                subscriptionFee: 25000,
            })
        }
        return {
            platformName: settings.platformName,
            contactEmail: settings.contactEmail,
            address: settings.address,
            platformFee: settings.platformFee,
            platformLogo: settings.platformLogo,
            platformIcon: settings.platformIcon,
            subscriptionFee: settings.subscriptionFee,
        }
    }

    async updatePlatformSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
        let existingSettings = await platFoemSettingsModel.findOne()
        if (!existingSettings) {
            existingSettings = await platFoemSettingsModel.create({
                platformName: 'WeCare',
                contactEmail: 'admin@wecare.com',
                address: '',
                platformFee: 0,
                platformLogo: '',
                platformIcon: '',
                subscriptionFee: 25000,
            })
        }

        const updated = await platFoemSettingsModel.findByIdAndUpdate(
            existingSettings._id,
            { $set: settings },
            { returnDocument: 'after' },
        )

        if (!updated) {
            throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update settings')
        }

        return {
            platformName: updated.platformName,
            contactEmail: updated.contactEmail,
            address: updated.address,
            platformFee: updated.platformFee,
            platformLogo: updated.platformLogo,
            platformIcon: updated.platformIcon,
            subscriptionFee: updated.subscriptionFee,
        }
    }

    async findByUserId(userId: string): Promise<{ profileImage?: string } | null> {
        const adminUser = await UserModel.findById(userId).lean()
        if (!adminUser) {
            return null
        }
        const adminDoc = await platFoemSettingsModel.findOne().lean()
        return {
            profileImage: adminDoc?.platformLogo || '',
        }
    }

    async getDashboardChartData(limit = 5, startDate?: string, endDate?: string): Promise<DashboardChartData> {
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const todayEnd = new Date(todayStart.getTime() + 86400000)

        const periodStart = startDate
            ? new Date(startDate + 'T00:00:00')
            : new Date(now.getFullYear(), now.getMonth(), 1)
        const periodEnd = endDate
            ? new Date(endDate + 'T23:59:59')
            : new Date(todayEnd)

        const pendingLimit = 5

        const [appointmentAgg, revenueAgg, dailyAppointmentAgg, dailyRevenueAgg, paymentMethodAgg, recentUsersAgg, pendingDocsAgg, pendingCaregiversAgg, totalDoctors, totalCaregivers, totalPatients] =
            await Promise.all([
                AppointmentModel.aggregate([
                    { $match: { appointmentDate: { $gte: periodStart, $lt: periodEnd } } },
                    { $group: { _id: '$status', count: { $sum: 1 } } },
                ]),
                PaymentModel.aggregate([
                    { $match: { status: 'success', paidAt: { $gte: periodStart, $lt: periodEnd } } },
                    {
                        $group: {
                            _id: null,
                            totalRevenue: { $sum: '$totalAmount' },
                            platformFees: { $sum: '$platformFee' },
                            consultationFees: { $sum: '$consultationFee' },
                        },
                    },
                ]),
                AppointmentModel.aggregate([
                    { $match: { appointmentDate: { $gte: periodStart, $lt: periodEnd } } },
                    {
                        $group: {
                            _id: {
                                $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate' },
                            },
                            confirmed: {
                                $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] },
                            },
                            completed: {
                                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
                            },
                            cancelled: {
                                $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
                            },
                            missed: {
                                $sum: { $cond: [{ $eq: ['$status', 'missed'] }, 1, 0] },
                            },
                        },
                    },
                    { $sort: { _id: 1 } },
                ]),
                PaymentModel.aggregate([
                    { $match: { status: 'success', paidAt: { $gte: periodStart, $lt: periodEnd } } },
                    {
                        $group: {
                            _id: {
                                $dateToString: { format: '%Y-%m-%d', date: '$paidAt' },
                            },
                            amount: { $sum: '$platformFee' },
                        },
                    },
                    { $sort: { _id: 1 } },
                ]),
                PaymentModel.aggregate([
                    { $match: { status: 'success', paidAt: { $gte: periodStart, $lt: periodEnd } } },
                    { $group: { _id: '$paymentMethod', count: { $sum: 1 } } },
                ]),
                UserModel.find({ role: { $in: ['doctor', 'caregiver', 'patient'] } })
                    .sort({ createdAt: -1 })
                    .limit(limit)
                    .select('name email role createdAt')
                    .lean(),
                DoctorModel.find({ verificationStatus: 'pending' })
                    .populate({ path: 'userId', select: 'name email profileImage' })
                    .sort({ createdAt: -1 })
                    .limit(pendingLimit)
                    .lean(),
                CaregiverModel.find({ verificationStatus: 'pending' })
                    .populate({ path: 'userId', select: 'name email profileImage' })
                    .sort({ createdAt: -1 })
                    .limit(pendingLimit)
                    .lean(),
                UserModel.countDocuments({ role: 'doctor' }),
                UserModel.countDocuments({ role: 'caregiver' }),
                UserModel.countDocuments({ role: 'patient' }),
            ])

        const todayAppointments = await AppointmentModel.aggregate([
            { $match: { appointmentDate: { $gte: todayStart, $lt: todayEnd } } },
            {
                $group: {
                    _id: null,
                    confirmed: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
                    completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                    cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
                    missed: { $sum: { $cond: [{ $eq: ['$status', 'missed'] }, 1, 0] } },
                    inConsultation: { $sum: { $cond: [{ $eq: ['$status', 'in_consultation'] }, 1, 0] } },
                },
            },
        ])

        const rawToday = todayAppointments[0] || {
            _id: null,
            confirmed: 0,
            completed: 0,
            cancelled: 0,
            missed: 0,
            inConsultation: 0,
        }
        const todayData = {
            confirmed: rawToday.confirmed,
            completed: rawToday.completed,
            cancelled: rawToday.cancelled,
            missed: rawToday.missed,
            inConsultation: rawToday.inConsultation,
        }

        const statusMap: Record<string, string> = {
            in_consultation: 'inConsultation',
            pending_payment: 'pendingPayment',
        }
        const thisMonthData: Record<string, number> = {
            pendingPayment: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0,
            missed: 0,
            inConsultation: 0,
        }
        for (const row of appointmentAgg) {
            const key = statusMap[row._id] || row._id
            thisMonthData[key] = row.count
        }

        const rawRevenue = revenueAgg[0] || { totalRevenue: 0, platformFees: 0, consultationFees: 0 }
        const revenueRow = {
            totalRevenue: rawRevenue.totalRevenue,
            platformFees: rawRevenue.platformFees,
            consultationFees: rawRevenue.consultationFees,
        }

        const dailyTrend = dailyAppointmentAgg.map((r) => ({
            date: r._id as string,
            confirmed: r.confirmed,
            completed: r.completed,
            cancelled: r.cancelled,
            missed: r.missed,
        }))

        const dailyRevenue = dailyRevenueAgg.map((r) => ({
            date: r._id as string,
            amount: r.amount,
        }))

        const paymentMethods: Record<string, number> = { razorpay: 0, wallet: 0 }
        for (const row of paymentMethodAgg) {
            paymentMethods[row._id as string] = row.count
        }

        const recentUsers = (recentUsersAgg as unknown as Array<Record<string, unknown>>).map((u) => ({
            _id: String(u._id),
            name: u.name as string,
            email: u.email as string,
            role: u.role as string,
            createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
        }))

        const appointmentStats: AppointmentStats = {
            today: todayData as AppointmentStats['today'],
            thisMonth: thisMonthData as AppointmentStats['thisMonth'],
            dailyTrend,
        }

        const revenueStats: RevenueStats = {
            thisMonth: revenueRow as RevenueStats['thisMonth'],
            dailyRevenue,
            paymentMethods: paymentMethods as RevenueStats['paymentMethods'],
        }

        const pendingDocs: PendingVerificationUser[] = (pendingDocsAgg as unknown as Array<Record<string, unknown>>).map((d) => {
            const userId = d.userId as Record<string, unknown> | undefined
            return {
                _id: String(d._id),
                name: (userId?.name as string) || '',
                email: (userId?.email as string) || '',
                profileImage: (userId?.profileImage as string) || undefined,
                role: 'doctor' as const,
                createdAt: typeof d.createdAt === 'string' ? d.createdAt : d.createdAt instanceof Date ? d.createdAt.toISOString() : String(d.createdAt),
            }
        })

        const pendingCaregivers: PendingVerificationUser[] = (pendingCaregiversAgg as unknown as Array<Record<string, unknown>>).map((c) => {
            const userId = c.userId as Record<string, unknown> | undefined
            return {
                _id: String(c._id),
                name: (userId?.name as string) || '',
                email: (userId?.email as string) || '',
                profileImage: (userId?.profileImage as string) || undefined,
                role: 'caregiver' as const,
                createdAt: typeof c.createdAt === 'string' ? c.createdAt : c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
            }
        })

        const mergedPending = [...pendingDocs, ...pendingCaregivers]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, pendingLimit)

        return { appointmentStats, revenueStats, recentUsers, pendingVerifications: mergedPending, totalDoctors, totalCaregivers, totalPatients }
    }
}
