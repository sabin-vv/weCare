import jwt, { SignOptions } from 'jsonwebtoken'

import env from '../config/env'
import { Payload } from '../modules/auth/interfaces/authInterface'

export const generateAccessToken = (payload: Payload) => {
    const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] }
    return jwt.sign(payload, env.jwtSecret, options)
}

export const generateRefreshToken = (payload: Payload) => {
    const options: SignOptions = { expiresIn: env.jwtRefreshExpiresIn as SignOptions['expiresIn'] }

    return jwt.sign(payload, env.jwtRefreshSecret, options)
}
export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, env.jwtRefreshSecret) as Payload
}
