import jwt, { SignOptions } from 'jsonwebtoken'

import { env } from '../config/env'
import { Payload } from './jwt.types'

export const generateAccessToken = (payload: Payload) => {
    const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES as SignOptions['expiresIn'] }
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, options)
}

export const generateRefreshToken = (payload: Payload) => {
    const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES as SignOptions['expiresIn'] }

    return jwt.sign(payload, env.JWT_REFRESH_SECRET, options)
}
export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as Payload
}

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as Payload
}
