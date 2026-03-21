import { AuthController } from './controllers/authController'
import { OtpController } from './controllers/otpControllers'
import { OtpRepository } from './repositories/otp.repository'
import { UserRepository } from './repositories/user.repository'
import { createAuthRoute } from './routes/authRoute'
import { AuthService } from './services/auth.service'
import { OtpService } from './services/otp.service'

const otpRepository = new OtpRepository()
const userRepository = new UserRepository()

const authService = new AuthService(userRepository)
const otpService = new OtpService(otpRepository, userRepository)

const authController = new AuthController(authService)
const otpController = new OtpController(otpService)

export const authRouter = createAuthRoute(authController, otpController)
