import { Types } from 'mongoose'

import { DoctorDocument, DoctorSearchFilter, PopulatedDoctorDocument } from '../types/doctor.types'

export interface IDoctorRepository {
    findById(id: string): Promise<DoctorDocument | null>
    findByIdWithUser(id: string): Promise<DoctorDocument | null>
    findByUserId(userId: Types.ObjectId): Promise<DoctorDocument | null>
    create(data: Partial<DoctorDocument>): Promise<DoctorDocument>
    updateByUserId(userId: Types.ObjectId, data: Partial<DoctorDocument>): Promise<DoctorDocument>
    search(
        filter: DoctorSearchFilter,
        options: { page: number; limit: number; sortBy?: string; sortOrder?: 'asc' | 'desc' },
    ): Promise<{ doctors: PopulatedDoctorDocument[]; total: number }>
    getSpecialties(): Promise<string[]>
}
