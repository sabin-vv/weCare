import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import type { User } from '@/features/auth/types/auth.types'
import type { AuthContextType } from '@/types/api.types'

const AuthContext = createContext<AuthContextType | null>(null)

const USER_KEY = 'user'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem(USER_KEY)
        return stored ? (JSON.parse(stored) as User) : null
    })
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === USER_KEY) {
                const stored = localStorage.getItem(USER_KEY)
                setUser(stored ? JSON.parse(stored) : null)
            }
        }

        window.addEventListener('storage', handleStorage)
        return () => window.removeEventListener('storage', handleStorage)
    }, [])

    const setAuth = useCallback((user: User) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user))

        setUser(user)
    }, [])

    const clearAuth = useCallback(() => {
        localStorage.removeItem(USER_KEY)
        setUser(null)
    }, [])

    const value = useMemo(
        () => ({
            user,
            setAuth,
            clearAuth,
            isAuthenticated: !!user,
        }),
        [user, setAuth, clearAuth],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
    return ctx
}
