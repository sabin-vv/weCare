import { CaregiverController } from './controllers/caregiverController'
import { CaregiverRepository } from './repositories/caregiver.repository'
import { createCaregiverRouter } from './routes/caregiverRouter'
import { CaregiverService } from './services/caregiver.service'

const caregiverRepository = new CaregiverRepository()
const caregiverService = new CaregiverService(caregiverRepository)
const caregiverController = new CaregiverController(caregiverService)

export const caregiverRouter = createCaregiverRouter(caregiverController)
