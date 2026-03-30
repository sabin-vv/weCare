import { MulterFiles } from '../../auth/types/auth.types'
import { CaregiverDocument } from '../types/caregiver.types'
import { RegisterCaregiverDTO } from '../validator/caregiver.schema'

export interface ICaregiverService {
    registerCaregiver(dto: RegisterCaregiverDTO, files: MulterFiles): Promise<CaregiverDocument>
}
