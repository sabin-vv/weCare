import { AuthController } from './controllers/authController'
import { OtpRepository } from './repositories/auth.repository'
import { UserRepository } from './repositories/user.repository'
import { createAuthRoute } from './routes/authRoute'
import { AuthService } from './services/otp.service'

const otpRepository = new OtpRepository()
const userRepository = new UserRepository()

const authService = new AuthService(otpRepository, userRepository)

const authController = new AuthController(authService)

export const authRouter = createAuthRoute(authController)
