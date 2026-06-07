import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { ICaregiverRepository } from '../../caregiver/interfaces/caregiver.repository.interface'
import { ICaregiverActivityRepository } from '../interfaces/caregiverActivity.repository.interface'
import { ICaregiverActivityService } from '../interfaces/caregiverActivity.service.interface'
import { toCaregiverActivityLogResponseDTO } from '../mapper/caregiverActivity.mapper'
import {
    CaregiverActivityLogDocument,
    CaregiverActivityLogListResponse,
    CreateActivityLogDTO,
} from '../types/caregiverActivity.types'

@injectable()
export class CaregiverActivityService implements ICaregiverActivityService {
    constructor(
        @inject(TOKENS.ICaregiverActivityRepository)
        private _activityRepo: ICaregiverActivityRepository,
        @inject(TOKENS.ICaregiverRepository) private _caregiverRepo: ICaregiverRepository,
    ) {}

    async logActivity(dto: CreateActivityLogDTO): Promise<CaregiverActivityLogDocument> {
        return this._activityRepo.create({
            caregiverId: dto.caregiverId,
            patientId: dto.patientId,
            activityType: dto.activityType,
            referenceId: dto.referenceId,
            description: dto.description,
        })
    }

    async getActivityLogs(userId: string, page = 1, limit = 8): Promise<CaregiverActivityLogListResponse> {
        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver profile not found')
        }

        const safePage = Math.max(1, page || 1)
        const safeLimit = Math.max(1, limit || 8)
        const skip = (safePage - 1) * safeLimit

        const [data, total] = await Promise.all([
            this._activityRepo.findByCaregiverId(caregiver._id.toString(), safeLimit, skip),
            this._activityRepo.countByCaregiverId(caregiver._id.toString()),
        ])

        return {
            data: data.map(toCaregiverActivityLogResponseDTO),
            pagination: {
                page: safePage,
                limit: safeLimit,
                totalCount: total,
                totalPages: Math.max(1, Math.ceil(total / safeLimit)),
            },
        }
    }
}
