import { Types } from 'mongoose'

import { CaregiverDocument } from '../types/caregiver.types'

export interface ICaregiverRepository {
    findByUserId(userId: Types.ObjectId): Promise<CaregiverDocument | null>
    creare(data: Partial<CaregiverDocument>): Promise<CaregiverDocument>
}
