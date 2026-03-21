import { UserRepository } from '../auth/repositories/user.repository'
import { DoctorController } from './controllers/doctorController'
import { DoctorRepository } from './repositories/doctor.repository'
import { createDoctorRouter } from './routes/doctorRoute'
import { DoctorService } from './services/doctor.service'

const doctorRepository = new DoctorRepository()
const userRepository = new UserRepository()
const doctorService = new DoctorService(doctorRepository, userRepository)
const doctorController = new DoctorController(doctorService)

export const doctorRouter = createDoctorRouter(doctorController)
