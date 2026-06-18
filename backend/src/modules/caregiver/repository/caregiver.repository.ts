import { PipelineStage, Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { UserModel } from '../../auth/models/user.model'
import { PatientModel } from '../../patient/models/patient.model'
import { ICaregiverRepository, PatientSummary } from '../interfaces/caregiver.repository.interface'
import { CaregiverModel } from '../models/caregiver.model'
import { CaregiverDocument, CaregiverWithUser } from '../types/caregiver.types'

@injectable()
export class CaregiverRepository extends BaseRepository<CaregiverDocument> implements ICaregiverRepository {
    constructor() {
        super(CaregiverModel)
    }

    async findByUserId(userId: Types.ObjectId): Promise<CaregiverDocument | null> {
        return this.model.findOne({ userId })
    }

    async findById(id: string): Promise<CaregiverDocument | null> {
        if (!Types.ObjectId.isValid(id)) return null
        return this.model.findById(id).lean()
    }

    async findAllActive(search?: string): Promise<CaregiverWithUser[]> {
        const pipeline: PipelineStage[] = [
            {
                $match: {
                    isActive: true,
                    isAvailable: true,
                    verificationStatus: 'verified',
                },
            },

            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },

            {
                $unwind: '$user',
            },
        ]

        if (search?.trim()) {
            pipeline.push({
                $match: {
                    'user.name': {
                        $regex: search,
                        $options: 'i',
                    },
                },
            })
        }

        return this.model.aggregate<CaregiverWithUser>(pipeline)
    }

    async updateByUserId(userId: Types.ObjectId, data: Partial<CaregiverDocument>): Promise<CaregiverDocument | null> {
        return this.model.findOneAndUpdate({ userId }, data, { returnDocument: 'after' })
    }

    async findPatientsByCaregiver(caregiverId: Types.ObjectId): Promise<PatientSummary[]> {
        const caregiver = await this.model.findById(caregiverId).lean()
        if (!caregiver) return []

        const patients = await PatientModel.find({ caregiverId: caregiver._id }).lean()

        if (patients.length === 0) return []

        const userIds = patients.map((p) => p.userId)
        const users = await UserModel.find({ _id: { $in: userIds } }).lean()
        const userMap = new Map(users.map((u) => [u._id.toString(), u]))

        return patients
            .map((p) => {
                const user = userMap.get(p.userId.toString())
                return {
                    _id: p._id,
                    patientId: p.patientId,
                    userId: p.userId,
                    dateOfBirth: p.dateOfBirth,
                    gender: p.gender,
                    conditions: p.conditions || [],
                    riskLevel: p.riskLevel || 'mild',
                    clinicalStatus: p.clinicalStatus || 'active',
                    profileImage: p.profileImage,
                    userName: user?.name || 'Unknown',
                    userMobile: user?.mobile || '',
                    userEmail: user?.email || '',
                } as PatientSummary & { userName: string; userMobile: string; userEmail: string }
            })
            .sort((a, b) => (a.userName || '').localeCompare(b.userName || ''))
    }
}
