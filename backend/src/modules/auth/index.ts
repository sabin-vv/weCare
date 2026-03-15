import { AuthController } from './controllers/authController'
import { OtpRepository } from './repositories/auth.repository'
import { DoctorRepository } from './repositories/doctor.repository'
import { createAuthRoute } from './routes/authRoute'
import { OtpService } from './services/otp.service'

const otpRepository = new OtpRepository()
const doctorRepository = new DoctorRepository()

const otpService = new OtpService(otpRepository, doctorRepository)

const authController = new AuthController(otpService)

export const authRouter = createAuthRoute(authController)
