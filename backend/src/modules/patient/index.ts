import { UserRepository } from '../auth/repositories/user.repository'
import { PatientController } from './controllers/patient.controller'
import { PatientRepository } from './repositories/patientRepository'
import { createPatientRoutes } from './routes/patientRoutes'
import { PatientServices } from './services/patientServices'

const patientRepository = new PatientRepository()
const userRepository = new UserRepository()
const patientServices = new PatientServices(patientRepository, userRepository)
const patientController = new PatientController(patientServices)

export const patientRouter = createPatientRoutes(patientController)
