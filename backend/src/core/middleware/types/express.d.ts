import { Payload } from '../../utils/jwt.types'

declare global {
    namespace Express {
        interface Request {
            user?: Payload
        }
    }
}

export {}