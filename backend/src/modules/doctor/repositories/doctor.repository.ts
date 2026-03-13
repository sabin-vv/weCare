import { CreateDoctorData } from '../interfaces/doctorInterface'
import Doctor from '../model/doctor'

export class DoctorRepository {
    async findByEmail(email: string) {
        return Doctor.findOne({ email })
    }
    async createDoctor(data: CreateDoctorData) {
        return Doctor.create(data)
    }
}
