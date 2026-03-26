import { DoctorDocument } from '../../types/doctor.types'

export interface IDoctorRepository {
    create(data: Partial<DoctorDocument>): Promise<DoctorDocument>
}
