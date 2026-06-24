import { AlertTriangle, Heart, Pill, Loader2, Inbox, XCircle, Activity } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getAlerts, acknowledgeAlert } from '../api/alert.api'
import { AlertCard } from '../components/AlertCard'
import type { AlertData, PaginationData } from '../types/doctor.types'

import styles from './AlertPage.module.css'

import DoctorLayout from '@/layout/DoctorLayout'
import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import Pagination from '@/shared/components/Pagination/Pagination'
import { Section } from '@/shared/components/Section/Section'
import SelectField from '@/shared/components/SelectField/SelectField'
import { useSocket } from '@/shared/context/SocketContext'
import { getErrorMessage } from '@/utils/getErrorMessage'

const ALERT_ICONS = {
    missed_medication: <Pill size={24} color="#ef4444" />,
    critical_vital: <Heart size={24} color="#ef4444" />,
    missed_vital: <Activity size={24} color="#ef4444" />,
    critical_symptom: <AlertTriangle size={24} color="#ef4444" />,
} as const

const PAGE_LIMIT = 8

const STATUS_OPTIONS = [
    { label: 'All Statuses', value: '' },
    { label: 'Open', value: 'open' },
    { label: 'Acknowledged', value: 'acknowledged' },
]

const TYPE_OPTIONS = [
    { label: 'All Types', value: '' },
    { label: 'Missed Medication', value: 'missed_medication' },
    { label: 'Critical Vital', value: 'critical_vital' },
    { label: 'Critical Symptom', value: 'critical_symptom' },
    { label: 'Missed Vital', value: 'missed_vital' },
]

const SEVERITY_OPTIONS = [
    { label: 'All Severities', value: '' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' },
]

const AlertPage = () => {
    const [alerts, setAlerts] = useState<AlertData[]>([])
    const [pagination, setPagination] = useState<PaginationData>({
        page: 1,
        limit: PAGE_LIMIT,
        totalCount: 0,
        totalPages: 0,
    })
    const [statusFilter, setStatusFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [severityFilter, setSeverityFilter] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const { socket } = useSocket()

    const fetchAlerts = async (page = 1) => {
        setIsLoading(true)
        try {
            const data = await getAlerts({
                page,
                limit: PAGE_LIMIT,
                status: statusFilter || undefined,
                type: typeFilter || undefined,
                severity: severityFilter || undefined,
            })
            setAlerts(data.alerts)
            setPagination(data.pagination)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAlerts(1)
    }, [statusFilter, typeFilter, severityFilter])

    useEffect(() => {
        if (!socket) return

        const handleNewAlert = (alert: AlertData) => {
            setAlerts((prev) => [alert, ...prev])
        }

        const handleAcknowledged = (alert: AlertData) => {
            setAlerts((prev) => prev.filter((a) => a._id !== alert._id))
        }

        socket.on('new_alert', handleNewAlert)
        socket.on('alert_acknowledged', handleAcknowledged)

        return () => {
            socket.off('new_alert', handleNewAlert)
            socket.off('alert_acknowledged', handleAcknowledged)
        }
    }, [socket])

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
            <MainWrapper title="Alerts" subtitle="Alerts awaiting acknowledgement">
                {isLoading && (
                    <div className={styles.centerState}>
                        <Loader2 size={32} className={styles.spinner} />
                        <p>Loading alerts...</p>
                    </div>
                )}

                {!isLoading && (
                    <div className={styles.filterBar}>
                        <div className={styles.filterFields}>
                            <SelectField
                                label="Status"
                                options={STATUS_OPTIONS}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            />
                            <SelectField
                                label="Type"
                                options={TYPE_OPTIONS}
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            />
                            <SelectField
                                label="Severity"
                                options={SEVERITY_OPTIONS}
                                value={severityFilter}
                                onChange={(e) => setSeverityFilter(e.target.value)}
                            />
                        </div>
                        {(statusFilter || typeFilter || severityFilter) && (
                            <button
                                className={styles.clearBtn}
                                onClick={() => {
                                    setStatusFilter('')
                                    setTypeFilter('')
                                    setSeverityFilter('')
                                }}
                                disabled={!statusFilter && !typeFilter && !severityFilter}
                            >
                                <XCircle size={16} /> Clear
                            </button>
                        )}
                    </div>
                )}

                {!isLoading && alerts.length === 0 && (
                    <div className={styles.centerState}>
                        <Inbox size={48} />
                        <p>No alerts</p>
                    </div>
                )}

                {!isLoading && alerts.length > 0 && (
                    <Section>
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
                        {!isLoading && (
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                totalCount={pagination.totalCount}
                                limit={pagination.limit}
                                onPageChange={(p) => fetchAlerts(p)}
                            />
                        )}
                    </Section>
                )}
            </MainWrapper>
        </DoctorLayout>
    )
}

export default AlertPage
