import Doctor from '../../doctor/model/doctor'

export class DoctorRepository {
    async findByEmail(email: string) {
        return Doctor.findOne({ email })
    }
}
