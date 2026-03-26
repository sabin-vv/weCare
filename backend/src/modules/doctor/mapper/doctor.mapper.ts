import { RegisterDoctorDTO } from '../../auth/dto/registerDoctor.dto'
import { DoctorEntity } from '../types/doctor.types'

type MulterFiles = Record<string, Express.Multer.File[]>

export const toDoctorEntity = (userId: string, dto: RegisterDoctorDTO, files: MulterFiles): DoctorEntity => {
    const specializationKeys = Object.keys(files || {})
        .filter((key) => key.startsWith('specializationDocument'))
        .sort()

    return {
        userId,
        medicalCertificateNumber: dto.medicalCertificateNumber,
        medicalCouncilRegisterNumber: dto.medicalCouncilRegisterNumber,

        specializations: dto.specializations.map((spec, index) => ({
            name: spec.name,
            documentImage: files?.[specializationKeys[index]]?.[0]?.originalname,
        })),

        govIdImage: files?.govIdImage?.[0]?.originalname,
        profileImage: files?.profileImage?.[0]?.originalname,
        medicalCertificateImage: files?.medicalCertificateImage?.[0]?.originalname,
        medicalCouncilImage: files?.medicalCouncilImage?.[0]?.originalname,
    }
}
