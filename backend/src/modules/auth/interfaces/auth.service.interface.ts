import { DoctorDocument } from '../../doctor/types/doctor.types'
import { RegisterDoctorDTO } from '../dto/registerDoctor.dto'
import { MulterFiles } from '../types/auth.types'

export interface IAuthService {
    registerDoctor(dto: RegisterDoctorDTO, files: MulterFiles): Promise<DoctorDocument>
}
