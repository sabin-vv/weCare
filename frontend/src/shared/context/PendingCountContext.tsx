import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

import { getPendingCaregiversCount, getPendingDoctorsCount } from '@/modules/admin/api/admin.api'

interface PendingCountContextType {
    doctorCount: number
    caregiverCount: number
    refreshCounts: () => Promise<void>
    isLoading: boolean
}

const PendingCountContext = createContext<PendingCountContextType | null>(null)

export const PendingCountProvider = ({ children }: { children: ReactNode }) => {
    const [doctorCount, setDoctorCount] = useState(0)
    const [caregiverCount, setCaregiverCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    const refreshCounts = useCallback(async () => {
        setIsLoading(true)
        try {
            const [doctors, caregivers] = await Promise.all([getPendingDoctorsCount(), getPendingCaregiversCount()])
            setDoctorCount(doctors.count)
            setCaregiverCount(caregivers.count)
        } catch (error) {
            console.error('Failed to fetch pending counts:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        refreshCounts()
    }, [refreshCounts])

    return (
        <PendingCountContext.Provider value={{ doctorCount, caregiverCount, refreshCounts, isLoading }}>
            {children}
        </PendingCountContext.Provider>
    )
}

export const usePendingCount = (): PendingCountContextType => {
    const context = useContext(PendingCountContext)
    if (!context) throw new Error('usePendingCount must be used within PendingCountProvider')
    return context
}
