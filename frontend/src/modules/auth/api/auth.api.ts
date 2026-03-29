import type { Role } from '../types/auth.types'

export interface ApiInterface {
    success: boolean
    message: string
}

export interface LoginUser extends ApiInterface {
    user: {
        name: string
        email: string
        role: Role
    }
}
