import type { Role, User } from '@/features/auth/types/auth.types'

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

export interface AuthContextType {
    user: User | null
    setAuth: (user: User) => void
    clearAuth: () => void
    isAuthenticated: boolean
}
