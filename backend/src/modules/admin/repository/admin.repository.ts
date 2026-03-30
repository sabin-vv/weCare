import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { UserModel } from '../../auth/models/user.model'
import { UserRole } from '../../auth/types/auth.types'
import { CaregiverModel } from '../../caregiver/models/caregiver.model'
import { VerificationStatus } from '../../caregiver/types/caregiver.types'
import { DoctorModel } from '../../doctor/models/doctor.model'
import { PatientModel } from '../../patient/models/patient.model'
import { IAdminRepository } from '../interfaces/admin.repository.interface'
import {
    AdminUserProfile,
    AdminVerificationStatus,
    PendingCaregiver,
    PendingCaregiversResponse,
    PendingCountResponse,
    PendingDoctor,
    PendingDoctorsResponse,
    UsersResponse,
} from '../types/admin.types'
import { escapeRegExp } from '../utils/escapeRegExp'

@injectable()
export class AdminRepository implements IAdminRepository {
    constructor(@inject(TOKENS.IUserRepository) _userRepo: unknown) {}

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

    async verifyDoctor(
        doctorId: string,
        status: AdminVerificationStatus,
        adminId: string,
    ): Promise<{ message: string }> {
        const doctor = await DoctorModel.findById(doctorId)
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor not found')
        }

        doctor.verificationStatus = status
        doctor.verifiedBy = new Types.ObjectId(adminId)
        doctor.verifiedAt = new Date()
        doctor.rejectReason = status === 'rejected' ? 'Rejected by admin' : ''
        await doctor.save()

        const isActive = status === 'verified'
        await UserModel.findByIdAndUpdate(doctor.userId, { isActive })

        return {
            message: status === 'verified' ? 'Doctor approved successfully' : 'Doctor rejected successfully',
        }
    }

    async verifySpecialization(
        doctorId: string,
        specIndex: number,
        verified: boolean,
        _adminId: string,
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

        await UserModel.findByIdAndUpdate(caregiver.userId, { isActive: status === 'verified' })

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
        const updated = await UserModel.findByIdAndUpdate(userId, { isActive }, { new: true })
        if (!updated) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        return { message: `User ${isActive ? 'enabled' : 'blocked'} successfully` }
    }
}
