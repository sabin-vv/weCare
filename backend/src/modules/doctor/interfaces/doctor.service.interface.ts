import { MulterFiles } from '../../auth/types/auth.types'
import { DoctorDocument } from '../types/doctor.types'
import { RegisterDoctorDTO } from '../validator/registerDoctor.schema'

export interface IDoctorService {
    registerDoctor(dto: RegisterDoctorDTO, files: MulterFiles): Promise<DoctorDocument>
}
