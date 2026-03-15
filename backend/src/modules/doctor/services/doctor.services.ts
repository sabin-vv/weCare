import bcrypt from 'bcrypt'

import { AppError } from '../../../utils/AppError'
import { uploadToS3 } from '../../../utils/uploadToS3'
import { userRepository } from '../../auth/repositories/user.repository'
import { SpecializationInput, updatedRegisterDoctor } from '../interfaces/doctorInterface'
import { DoctorRepository } from '../repositories/doctor.repository'

export class DoctorService {
    constructor(private doctorRepository: DoctorRepository) {}
    async registerDoctor(body: updatedRegisterDoctor, files: Express.Multer.File[]) {
        const { name, email, mobile, password, medicalCertificateNumber, medicalCouncilRegisterNumber } = body

        const doctorExist = await this.doctorRepository.findByEmail(email)
        if (doctorExist) {
            throw new AppError(400, 'Doctor already exist with this email')
        }
        const hashedPassword = await bcrypt.hash(password, 10)

        const govIdFile = files.find((f) => f.fieldname === 'govId')
        const profileImageFile = files.find((f) => f.fieldname === 'profileImage')
        const medicalCertificateFile = files.find((f) => f.fieldname === 'medicalCertificateImage')
        const medicalCouncilFile = files.find((f) => f.fieldname === 'medicalCouncilImage')

        const govIdUrl = await uploadToS3(govIdFile!)

        const profileImageUrl = await uploadToS3(profileImageFile!)
        const medicalCertificateImage = await uploadToS3(medicalCertificateFile!)
        const medicalCouncilImage = await uploadToS3(medicalCouncilFile!)

        const parsedSpecializations: SpecializationInput[] = JSON.parse(body.specializations)
        const formattedSpecializations = await Promise.all(
            parsedSpecializations.map(async (spec: SpecializationInput, index: number) => {
                const file = files.find((f) => f.fieldname === `specializationDocument${index}`)

                let documentImage = ''

                if (file) documentImage = await uploadToS3(file)
                return {
                    name: spec.name,

                    documentImage,
                }
            }),
        )

        const formattedMobile = mobile.startsWith('+') ? mobile : `+${mobile}`

        const user = await userRepository.createUser({
            name,
            email,
            mobile: formattedMobile,
            password: hashedPassword,
            role: 'doctor',
            isActive: true,
        })

        const doctorData = {
            userId: user._id,
            govIdImage: govIdUrl,
            profileImage: profileImageUrl,
            medicalCertificateNumber,
            medicalCertificateImage: medicalCertificateImage,
            medicalCouncilRegisterNumber,
            medicalCouncilImage: medicalCouncilImage,
            specializations: formattedSpecializations,
        }

        try {
            const doctor = await this.doctorRepository.createDoctor(doctorData)

            return { success: true, message: 'Account created Successfully', doctor }
        } catch (error) {
            throw new AppError(
                500,
                `Failed to save doctor to database: ${error instanceof Error ? error.message : 'Unknown error'}`,
            )
        }
    }
}
