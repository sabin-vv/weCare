import { UserRepository } from '../auth/repositories/user.repository'
import { CaregiverController } from './controllers/caregiverController'
import { CaregiverRepository } from './repositories/caregiver.repository'
import { createCaregiverRouter } from './routes/caregiverRouter'
import { CaregiverService } from './services/caregiver.service'

const caregiverRepository = new CaregiverRepository()
const userRepository = new UserRepository()
const caregiverService = new CaregiverService(caregiverRepository, userRepository)
const caregiverController = new CaregiverController(caregiverService)

export const caregiverRouter = createCaregiverRouter(caregiverController)
