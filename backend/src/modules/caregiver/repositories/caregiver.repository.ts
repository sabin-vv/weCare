import User from '../../auth/model/user'
import { CreateCaregiverData } from '../interfaces/caregiverIneterface'
import Caregiver from '../models/caregiver'

export class CaregiverRepository {
    async findByEmail(email: string) {
        const user = await User.findOne({ email })
        if (!user) return null

        return await Caregiver.findOne({ userId: user._id }).populate('userId', 'email')
    }
    async createCaregiver(data: CreateCaregiverData) {
        return Caregiver.create(data)
    }
}
