import { ArrowRight } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { getAlerts, acknowledgeAlert } from '../../api/alert.api'
import { getAppointmentStats, getDashboardStats, getDoctorAppointments } from '../../api/doctor.api'
import type {
    AlertData,
    AppointmentStats,
    DashboardStats as DashboardStatsType,
    DoctorAppointment,
} from '../../types/doctor.types'
import { AlertCard } from '../AlertCard'

import styles from './Dashboard.module.css'

import Button from '@/shared/components/Button/Button'
import DatePicker from '@/shared/components/DatePicker/DatePicker'
import { Section } from '@/shared/components/Section/Section'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { getFileUrl } from '@/utils/getFileUrl'

const DASHBOARD_LIST_LIMIT = 4

const getLocalDateString = (date: Date) => {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')

    return `${year}-${month}-${day}`
}

const StatCard = ({ title, value }: { title: string; value: number }) => (
    <div className={styles.statCard}>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statTitle}>{title}</span>
    </div>
)

const AppointmentRow = ({ appointment }: { appointment: DoctorAppointment }) => {
    const [imgError, setImgError] = useState(false)
    const imageUrl = appointment.profileImage ? getFileUrl(appointment.profileImage) : ''
    const initials = appointment.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className={styles.appointmentRow}>
            <div className={styles.appointmentPatient}>
                {imageUrl && !imgError ? (
                    <img
                        src={imageUrl}
                        alt={appointment.name}
                        className={styles.avatar}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className={styles.avatarFallback}>{initials}</div>
                )}
                <div>
                    <span className={styles.patientName}>{appointment.name}</span>
                    <span className={styles.appointmentTime}>
                        {appointment.slotStart} - {appointment.slotEnd}
                    </span>
                </div>
            </div>
            <span className={`${styles.statusBadge} ${styles[appointment.status]}`}>
                {appointment.status === 'confirmed' ? 'Pending' : 'Completed'}
            </span>
        </div>
    )
}

const CATEGORY_COLORS: Record<string, string> = {
    appointment: '#3b82f6',
    prescription: '#10b981',
    vital: '#10b981',
    alert: '#f59e0b',
    caregiver: '#8b5cf6',
}

const getActionColor = (action: string) => {
    const prefix = Object.keys(CATEGORY_COLORS).find((key) => action.startsWith(key))
    return prefix ? CATEGORY_COLORS[prefix] : '#6b7280'
}

const ActivityItem = ({
    action,
    description,
    createdAt,
}: {
    action: string
    description: string
    createdAt: string
}) => (
    <div className={styles.activityItem} style={{ borderLeftColor: getActionColor(action) }}>
        <div className={styles.activityTop}>
            <span className={styles.activityAction}>{action.replace(/_/g, ' ')}</span>
            <span className={styles.activityTime}>{new Date(createdAt).toLocaleString()}</span>
        </div>
        <span className={styles.activityDescription}>{description}</span>
    </div>
)

const getMonthStart = () => {
    const now = new Date()
    return getLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1))
}

const Dashboard = () => {
    const navigate = useNavigate()
    const [stats, setStats] = useState<DashboardStatsType | null>(null)
    const [appointments, setAppointments] = useState<DoctorAppointment[]>([])
    const [alerts, setAlerts] = useState<AlertData[]>([])
    const [appointmentStats, setAppointmentStats] = useState<AppointmentStats | null>(null)
    const [startDate, setStartDate] = useState(getMonthStart)
    const [endDate, setEndDate] = useState(getLocalDateString(new Date()))
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true)
            try {
                const today = getLocalDateString(new Date())
                const [dashboardData, appointmentData, alertsData] = await Promise.all([
                    getDashboardStats(),
                    getDoctorAppointments('', 1, DASHBOARD_LIST_LIMIT, today),
                    getAlerts({ status: 'open', limit: DASHBOARD_LIST_LIMIT }),
                ])
                setStats(dashboardData)
                setAppointments(appointmentData.appointments.slice(0, DASHBOARD_LIST_LIMIT))
                setAlerts(alertsData.slice(0, DASHBOARD_LIST_LIMIT))
            } catch (error) {
                toast.error(getErrorMessage(error))
            } finally {
                setIsLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    const fetchAppointmentStats = useCallback(async () => {
        try {
            const data = await getAppointmentStats(startDate, endDate)
            setAppointmentStats(data)
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }, [startDate, endDate])

    useEffect(() => {
        fetchAppointmentStats()
    }, [fetchAppointmentStats])

    const handleAcknowledge = async (alertId: string) => {
        try {
            await acknowledgeAlert(alertId)
            setAlerts((prev) => prev.filter((a) => a._id !== alertId))
            if (stats) {
                setStats({ ...stats, openAlerts: Math.max(0, stats.openAlerts - 1) })
            }
            toast.success('Alert acknowledged')
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    if (isLoading) {
        return <div className={styles.loading}>Loading dashboard...</div>
    }

    return (
        <>
            <div className={styles.cardWrapper}>
                <StatCard title="Active Patients" value={stats?.activePatients ?? 0} />
                <StatCard title="Today's Appointments" value={stats?.todayAppointments ?? 0} />
                <StatCard title="Open Alerts" value={stats?.openAlerts ?? 0} />
                <StatCard title="Active Caregivers" value={stats?.activeCaregivers ?? 0} />
            </div>

            <Section
                title="Appointment Overview"
                actions={
                    <div className={styles.dateFilter}>
                        <DatePicker value={startDate} onChange={setStartDate} />
                        <span className={styles.dateSeparator}>to</span>
                        <DatePicker value={endDate} onChange={setEndDate} />
                    </div>
                }
            >
                <div className={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={appointmentStats?.dailyStats ?? []}
                            margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                        >
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11 }}
                                tickFormatter={(val) => {
                                    if (!val) return ''
                                    const d = new Date(String(val) + 'T00:00:00')
                                    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                                }}
                            />
                            <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
                            <Tooltip
                                labelFormatter={(label) => {
                                    if (!label) return ''
                                    const d = new Date(String(label) + 'T00:00:00')
                                    return d.toLocaleDateString('en-IN', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })
                                }}
                            />
                            <Legend />
                            <Bar dataKey="missed" fill="#f59e0b" name="Missed" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Section>

            <div className={styles.twoColumn}>
                <Section
                    title="Today's Appointments"
                    actions={
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            fullWidth={false}
                            leftIcon={<ArrowRight size={16} />}
                            onClick={() => navigate('/doctor/appointments')}
                        >
                            View All
                        </Button>
                    }
                >
                    <div className={styles.appointmentList}>
                        {appointments.length === 0 ? (
                            <p className={styles.empty}>No appointments today</p>
                        ) : (
                            appointments.map((apt) => <AppointmentRow key={apt.appointmentId} appointment={apt} />)
                        )}
                    </div>
                </Section>

                <Section title="Recent Activity">
                    <div className={styles.activityList}>
                        {!stats || stats.recentActivity.length === 0 ? (
                            <p className={styles.empty}>No recent activity</p>
                        ) : (
                            stats.recentActivity
                                .slice(0, DASHBOARD_LIST_LIMIT)
                                .map((activity, i) => <ActivityItem key={i} {...activity} />)
                        )}
                    </div>
                </Section>
            </div>

            <Section
                title="Open Alerts"
                actions={
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        fullWidth={false}
                        leftIcon={<ArrowRight size={16} />}
                        onClick={() => navigate('/doctor/alerts')}
                    >
                        View All
                    </Button>
                }
            >
                <div className={styles.alertList}>
                    {alerts.length === 0 ? (
                        <p className={styles.empty}>No open alerts</p>
                    ) : (
                        alerts.map((alert) => (
                            <AlertCard
                                key={alert._id}
                                patientName={
                                    typeof alert.patientId === 'object' && 'userId' in alert.patientId
                                        ? alert.patientId.userId.name
                                        : 'Unknown'
                                }
                                message={alert.triggerReason}
                                timestamp={new Date(alert.triggeredAt).toLocaleString()}
                                severity={alert.severity}
                                status={alert.status}
                                icon={<span className={styles.alertIcon}>!</span>}
                                onAcknowledge={() => handleAcknowledge(alert._id)}
                            />
                        ))
                    )}
                </div>
            </Section>
        </>
    )
}

export default Dashboard
