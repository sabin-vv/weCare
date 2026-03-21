import { UserRepository } from '../auth/repositories/user.repository'
import { PatientController } from './controllers/patient.controller'
import { PatientRepository } from './repositories/patient.repository'
import { createPatientRoutes } from './routes/patientRoutes'
import { PatientService } from './services/patient.service'

const patientRepository = new PatientRepository()
const userRepository = new UserRepository()
const patientService = new PatientService(patientRepository, userRepository)
const patientController = new PatientController(patientService)

export const patientRouter = createPatientRoutes(patientController)
