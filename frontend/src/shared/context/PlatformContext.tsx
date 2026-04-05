import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { getPlatformSettings } from '@/modules/admin/api/admin.api'
import type { PlatformSettings } from '@/modules/admin/interfaces/admin.interface'

interface PlatformContextType {
    settings: PlatformSettings | null
    loading: boolean
}

export const PlatformContext = createContext<PlatformContextType | null>(null)

export const PlatformProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useState<PlatformSettings | null>(null)
    const [loading, setLoading] = useState(true)

    const loadSettings = useCallback(async () => {
        try {
            const data = await getPlatformSettings()
            setSettings(data)
        } catch (error) {
            console.error('Failed to load platform settings:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadSettings()
    }, [loadSettings])

    const value = useMemo(
        () => ({
            settings,
            loading,
        }),
        [settings, loading],
    )

    return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>
}

export const usePlatform = (): PlatformContextType => {
    const context = useContext(PlatformContext)
    if (!context) {
        throw new Error('usePlatform must be used inside <PlatformProvider>')
    }
    return context
}
