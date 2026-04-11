import { DoctorDocument, DoctorProfileResponse } from '../types/doctor.types'
import { DoctorDTO } from '../validator/registerDoctor.schema'

export interface IDoctorService {
    createProfile(userId: string, dto: DoctorDTO): Promise<DoctorDocument>
    getProfile(userId: string): Promise<DoctorProfileResponse>
}
