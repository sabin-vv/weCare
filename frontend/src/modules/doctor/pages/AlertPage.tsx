import { AlertTriangle, Heart, Pill, Loader2, Inbox } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getAlerts, acknowledgeAlert } from '../api/alert.api'
import { AlertCard } from '../components/AlertCard'
import type { AlertData } from '../types/doctor.types'

import styles from './AlertPage.module.css'

import DoctorLayout from '@/layout/DoctorLayout'
import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import { getErrorMessage } from '@/utils/getErrorMessage'

const ALERT_ICONS = {
    missed_medication: <Pill size={24} />,
    critical_vital: <Heart size={24} />,
    critical_symptom: <AlertTriangle size={24} />,
} as const

const AlertPage = () => {
    const [alerts, setAlerts] = useState<AlertData[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchAlerts = async () => {
        setIsLoading(true)
        try {
            const data = await getAlerts()
            setAlerts(data)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAlerts()
    }, [])

    const handleAcknowledge = async (alertId: string) => {
        try {
            await acknowledgeAlert(alertId)
            toast.success('Alert acknowledged')
            setAlerts((prev) => prev.filter((a) => a._id !== alertId))
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const formatTimestamp = (iso: string) => {
        const date = new Date(iso)
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <DoctorLayout>
            <MainWrapper title="Alerts">
                {isLoading && (
                    <div className={styles.centerState}>
                        <Loader2 size={32} className={styles.spinner} />
                        <p>Loading alerts...</p>
                    </div>
                )}

                {!isLoading && alerts.length === 0 && (
                    <div className={styles.centerState}>
                        <Inbox size={48} />
                        <p>No alerts</p>
                    </div>
                )}

                {!isLoading && alerts.length > 0 && (
                    <div className={styles.list}>
                        {alerts.map((alert) => (
                            <AlertCard
                                key={alert._id}
                                patientName={alert.patientId?.userId?.name ?? 'Unknown'}
                                message={alert.triggerReason}
                                timestamp={formatTimestamp(alert.triggeredAt)}
                                severity={alert.severity}
                                status={alert.status}
                                icon={ALERT_ICONS[alert.type] ?? <AlertTriangle size={24} />}
                                onAcknowledge={alert.status === 'open' ? () => handleAcknowledge(alert._id) : undefined}
                                acknowledgedBy={
                                    alert.status === 'acknowledged'
                                        ? alert.acknowledgeAt
                                            ? formatTimestamp(alert.acknowledgeAt)
                                            : 'Acknowledged'
                                        : undefined
                                }
                            />
                        ))}
                    </div>
                )}
            </MainWrapper>
        </DoctorLayout>
    )
}

export default AlertPage
