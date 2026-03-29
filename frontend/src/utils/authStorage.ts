import type { User } from '@/modules/auth/types/auth.types'

export const getStoredUser = () => {
    try {
        const data = localStorage.getItem('user')
        return data ? JSON.parse(data) : null
    } catch {
        return null
    }
}

export const setStoredUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user))
}

export const clearStoredUser = () => {
    localStorage.removeItem('user')
}
