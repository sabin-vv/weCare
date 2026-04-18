import { Types } from 'mongoose'

import { CaregiverDocument } from '../types/caregiver.types'

export interface ICaregiverRepository {
    findByUserId(userId: Types.ObjectId): Promise<CaregiverDocument | null>
    create(data: Partial<CaregiverDocument>): Promise<CaregiverDocument>
    updateByUserId(userId: Types.ObjectId, data: Partial<CaregiverDocument>): Promise<CaregiverDocument>
}
