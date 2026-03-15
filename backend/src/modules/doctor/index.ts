import { DoctorController } from './controllers/doctorController'
import { DoctorRepository } from './repositories/doctor.repository'
import { createDoctorRouter } from './routes/doctorRoute'
import { DoctorService } from './services/doctor.services'

const doctorRepository = new DoctorRepository()
const doctorService = new DoctorService(doctorRepository)
const doctorController = new DoctorController(doctorService)

export const doctorRouter = createDoctorRouter(doctorController)
