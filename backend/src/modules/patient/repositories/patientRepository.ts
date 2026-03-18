import User from '../../auth/model/user'
import { PatientData } from '../interfaces/patientInterfaces'
import Patient from '../models/patient'

export class PatientRepository {
    async findByEmail(email: string) {
        const user = await User.findOne({ email })
        if (!user) return null

        return await Patient.findOne({ userId: user._id }).populate('userId', 'email')
    }

    async createPatient(data: PatientData) {
        return Patient.create(data)
    }
}
