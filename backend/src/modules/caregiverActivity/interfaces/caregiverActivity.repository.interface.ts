import { CaregiverActivityLogDocument } from '../types/caregiverActivity.types'

export interface ICaregiverActivityRepository {
    create(data: Partial<CaregiverActivityLogDocument>): Promise<CaregiverActivityLogDocument>
    findByCaregiverId(
        caregiverId: string,
        limit?: number,
        skip?: number,
    ): Promise<CaregiverActivityLogDocument[]>
    countByCaregiverId(caregiverId: string): Promise<number>
}
