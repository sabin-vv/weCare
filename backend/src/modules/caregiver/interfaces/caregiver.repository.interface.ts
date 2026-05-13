import { Types } from 'mongoose'

import { CaregiverDocument } from '../types/caregiver.types'

export interface ICaregiverRepository {
    findByUserId(userId: Types.ObjectId): Promise<CaregiverDocument | null>
    findById(id: string): Promise<CaregiverDocument | null>
    findAllActive(search?: string): Promise<CaregiverDocument[]>
    create(data: Partial<CaregiverDocument>): Promise<CaregiverDocument>
    updateByUserId(userId: Types.ObjectId, data: Partial<CaregiverDocument>): Promise<CaregiverDocument | null>
}
