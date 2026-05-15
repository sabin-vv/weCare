import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

import { getMyPatients, getPatientMedications as getCaregiverPatientMedications } from '@/modules/caregiver/api/caregiver.api'
import {
    getPatientAppointments,
    getPatientMedications,
    getPatientVitalSchedules,
} from '@/modules/patient/api/patient.api'
import { useAuth } from '@/shared/context/AuthContext'

interface NotificationCountContextType {
    count: number
    isLoading: boolean
    refreshCount: () => Promise<void>
}

const NotificationCountContext = createContext<NotificationCountContextType | null>(null)

const POLL_INTERVAL_MS = 60_000

export const NotificationCountProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth()
    const [count, setCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const refreshCount = useCallback(async () => {
        if (!user) {
            setCount(0)
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        try {
            if (user.role === 'caregiver') {
                const patients = await getMyPatients()
                const medicationGroups = await Promise.all(
                    patients.map((patient) => getCaregiverPatientMedications(patient._id)),
                )

                const caregiverAlertCount = medicationGroups.flat().filter((medication) => {
                    return medication.status === 'pending' || medication.status === 'missed'
                }).length

                setCount(caregiverAlertCount)
                return
            }

            if (user.role === 'patient') {
                const [medications, vitalSchedules, appointments] = await Promise.all([
                    getPatientMedications(),
                    getPatientVitalSchedules(),
                    getPatientAppointments(),
                ])

                const medicationAlerts = medications.filter((medication) => {
                    return medication.status === 'pending' || medication.status === 'missed'
                }).length

                const vitalAlerts = vitalSchedules.filter((vital) => {
                    return vital.status === 'pending' || vital.status === 'missed'
                }).length

                const appointmentAlerts = appointments.filter((appointment) => {
                    return appointment.status === 'pending_payment'
                }).length

                setCount(medicationAlerts + vitalAlerts + appointmentAlerts)
                return
            }

            setCount(0)
        } catch (error) {
            console.error('Failed to fetch notification count:', error)
            setCount(0)
        } finally {
            setIsLoading(false)
        }
    }, [user])

    useEffect(() => {
        void refreshCount()
    }, [refreshCount])

    useEffect(() => {
        if (!user) return

        const intervalId = window.setInterval(() => {
            void refreshCount()
        }, POLL_INTERVAL_MS)

        return () => window.clearInterval(intervalId)
    }, [refreshCount, user])

    return (
        <NotificationCountContext.Provider value={{ count, isLoading, refreshCount }}>
            {children}
        </NotificationCountContext.Provider>
    )
}

export const useNotificationCount = (): NotificationCountContextType => {
    const context = useContext(NotificationCountContext)
    if (!context) throw new Error('useNotificationCount must be used within NotificationCountProvider')
    return context
}
