import User from '../../auth/model/user'
import { CreateDoctorData } from '../interfaces/doctorInterface'
import Doctor from '../model/doctor'

export class DoctorRepository {
    async findByEmail(email: string) {
        const user = await User.findOne({ email })
        if (!user) return null

        return await Doctor.findOne({ userId: user._id }).populate('userId', 'email')
    }
    async createDoctor(data: CreateDoctorData) {
        return Doctor.create(data)
    }
}
