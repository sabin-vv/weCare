import bcrypt from 'bcrypt'

import { Role } from '../../../interfaces/user.auth'
import { AppError } from '../../../utils/AppError'
import { uploadToS3 } from '../../../utils/uploadToS3'
import { UserRepository } from '../../auth/repositories/user.repository'
import { caregiverRegister } from '../interfaces/caregiverIneterface'
import { CaregiverRepository } from '../repositories/caregiver.repository'

export class CaregiverService {
    constructor(
        private caregiverRepository: CaregiverRepository,
        private userRepository: UserRepository,
    ) {}
    async registerCaregiver(body: caregiverRegister, files: Record<string, Express.Multer.File[]>) {
        const { name, email, mobile, password, certificateNumber, licenseNumber } = body
        const caregiverExist = await this.caregiverRepository.findByEmail(email)
        if (caregiverExist) {
            throw new AppError(400, 'Caregiver with this email is already exist')
        }
        const govId = files.govId?.[0]
        const profileImage = files.profileImage?.[0]
        const certificateImage = files.certificateImage?.[0]
        const licenseImage = files.licenseImage?.[0]

        if (!govId) throw new AppError(400, 'Government ID required')
        if (!profileImage) throw new AppError(400, 'Profile image required')
        if (!certificateImage) throw new AppError(400, 'Certificate image is required')
        if (!licenseImage) throw new AppError(400, 'License image is requrired')

        const govIdUrl = await uploadToS3(govId)
        const profileImageUrl = await uploadToS3(profileImage)
        const certificateImageUrl = await uploadToS3(certificateImage)
        const licenseImageUrl = await uploadToS3(licenseImage)

        const hashedPassword = await bcrypt.hash(password, 10)

        const formattedMobile = mobile.startsWith('+') ? mobile : `+${mobile}`

        const user = await this.userRepository.createUser({
            name,
            email,
            mobile: formattedMobile,
            password: hashedPassword,
            role: Role.CAREGIVER,
            isActive: true,
        })
        const caregiverData = {
            userId: user._id,
            govIdImage: govIdUrl,
            profileImage: profileImageUrl,
            certificateNumber,
            certificateImage: certificateImageUrl,
            licenseNumber,
            licenseImage: licenseImageUrl,
        }
        try {
            const caregiver = await this.caregiverRepository.createCaregiver(caregiverData)
            return { success: true, message: 'Account created successfully', data: caregiver }
        } catch (error) {
            throw new AppError(500, error)
        }
    }
}
