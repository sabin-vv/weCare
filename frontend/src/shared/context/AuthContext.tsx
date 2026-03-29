import type { AuthContextType, User } from '@/modules/auth/types/auth.types'
import { clearStoredUser, getStoredUser, setStoredUser } from '@/utils/authStorage'
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => getStoredUser())

    useEffect(() => {
        const handleStorage = () => {
            setUser(getStoredUser())
        }

        window.addEventListener('storage', handleStorage)
        return () => window.removeEventListener('storage', handleStorage)
    }, [])

    const setAuth = useCallback((user: User) => {
        setStoredUser(user)
        setUser(user)
    }, [])

    const clearAuth = useCallback(() => {
        clearStoredUser()
        setUser(null)
    }, [])

    const value = useMemo(
        () => ({
            user,
            setAuth,
            clearAuth,
            isAuthenticated: !!user,
        }),
        [user],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
