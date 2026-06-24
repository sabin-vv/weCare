import { useCallback, useEffect, useState } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from 'recharts'

import { getDashboardChartData, getActivityLogs } from '../api/admin.api'
import StatCard from '../components/StatCard'
import type { ActivityLogEntry, AppointmentStats, DashboardChartData, RevenueStats } from '../types/admin.types'

import styles from './AdminDashboard.module.css'

import DateRangePicker from '@/shared/components/DateRangePicker/DateRangePicker'
import type { DateRange } from '@/shared/components/DateRangePicker/DateRangePicker.types'
import { Section } from '@/shared/components/Section/Section'
import { useAuth } from '@/shared/context/AuthContext'

const PIE_COLORS = ['#22c55e', '#ef4444', '#3b82f6']

const todayStr = () => new Date().toISOString().slice(0, 10)
const monthStart = () => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

const defaultRange: DateRange = { start: monthStart(), end: todayStr() }

const AdminDashboard = () => {
    const { user } = useAuth()
    const [overview, setOverview] = useState<DashboardChartData | null>(null)
    const [recentLogs, setRecentLogs] = useState<ActivityLogEntry[]>([])
    const [pieRange, setPieRange] = useState<DateRange>(defaultRange)
    const [barRange, setBarRange] = useState<DateRange>(defaultRange)
    const [lineRange, setLineRange] = useState<DateRange>(defaultRange)
    const [pieStats, setPieStats] = useState<AppointmentStats | null>(null)
    const [barStats, setBarStats] = useState<AppointmentStats | null>(null)
    const [lineStats, setLineStats] = useState<RevenueStats | null>(null)

    useEffect(() => {
        getDashboardChartData(5)
            .then(setOverview)
            .catch(() => {})
        getActivityLogs(1, 5)
            .then((res) => setRecentLogs(res.data))
            .catch(() => {})
    }, [])

    const fetchPie = useCallback(() => {
        getDashboardChartData(5, pieRange.start, pieRange.end)
            .then((d) => setPieStats(d.appointmentStats))
            .catch(() => {})
    }, [pieRange])

    const fetchBar = useCallback(() => {
        getDashboardChartData(5, barRange.start, barRange.end)
            .then((d) => setBarStats(d.appointmentStats))
            .catch(() => {})
    }, [barRange])

    const fetchLine = useCallback(() => {
        getDashboardChartData(5, lineRange.start, lineRange.end)
            .then((d) => setLineStats(d.revenueStats))
            .catch(() => {})
    }, [lineRange])

    useEffect(() => {
        fetchPie()
    }, [fetchPie])
    useEffect(() => {
        fetchBar()
    }, [fetchBar])
    useEffect(() => {
        fetchLine()
    }, [fetchLine])

    const periodPie = pieStats
        ? [
              { name: 'Completed', value: pieStats.thisMonth.completed },
              { name: 'Cancelled', value: pieStats.thisMonth.cancelled },
              {
                  name: 'Upcoming',
                  value:
                      pieStats.thisMonth.confirmed +
                      pieStats.thisMonth.inConsultation +
                      pieStats.thisMonth.pendingPayment,
              },
          ].filter((item) => item.value > 0)
        : []

    const pieTotal = pieStats
        ? pieStats.thisMonth.completed +
          pieStats.thisMonth.cancelled +
          pieStats.thisMonth.confirmed +
          pieStats.thisMonth.inConsultation +
          pieStats.thisMonth.pendingPayment
        : 0

    const totalAppointments = pieStats ? Object.values(pieStats.thisMonth).reduce((a, b) => a + b, 0) : 0

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>{`${user?.name}'s Dashboard`}</h1>

            <div className={styles.statsGrid}>
                <StatCard title="Total Doctors" value={overview?.totalDoctors ?? 0} />
                <StatCard title="Total Caregivers" value={overview?.totalCaregivers ?? 0} />
                <StatCard title="Total Patients" value={overview?.totalPatients ?? 0} />
                <StatCard title="Total Appointments" value={totalAppointments} />
            </div>

            <div className={styles.chartRow}>
                <Section
                    title="Appointment Status"
                    actions={<DateRangePicker value={pieRange} onChange={setPieRange} maxDate={new Date()} />}
                >
                    {pieStats && (
                        <div className={styles.chartWrapper}>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={periodPie}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        dataKey="value"
                                        label={({ name, percent }: { name?: string; percent?: number }) =>
                                            `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                                        }
                                    >
                                        {periodPie.map((_, i) => (
                                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className={styles.totalCenter}>
                                <span className={styles.totalCount}>{pieTotal}</span>
                                <span className={styles.totalLabel}>Total</span>
                            </div>
                        </div>
                    )}
                </Section>

                <Section
                    title="Daily Appointments"
                    actions={<DateRangePicker value={barRange} onChange={setBarRange} maxDate={new Date()} />}
                >
                    {barStats && (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={barStats.dailyTrend} barCategoryGap="40%">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={(val) => {
                                        if (!val || typeof val !== 'string') return ''
                                        const d = new Date(val + 'T00:00:00')
                                        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    }}
                                />
                                <YAxis />
                                <Tooltip
                                    labelFormatter={(val) => {
                                        if (!val || typeof val !== 'string') return ''
                                        const d = new Date(val + 'T00:00:00')
                                        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="confirmed" stackId="a" fill="#3b82f6" name="Confirmed" maxBarSize={24} />
                                <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Completed" maxBarSize={24} />
                                <Bar dataKey="cancelled" stackId="a" fill="#ef4444" name="Cancelled" maxBarSize={24} />
                                <Bar dataKey="missed" stackId="a" fill="#f59e0b" name="Missed" maxBarSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Section>
            </div>

            <div className={styles.chartRow}>
                <Section
                    title="Daily Revenue"
                    actions={<DateRangePicker value={lineRange} onChange={setLineRange} maxDate={new Date()} />}
                >
                    {lineStats && (
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={lineStats.dailyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={(val) => {
                                        const d = new Date(val + 'T00:00:00')
                                        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    }}
                                />
                                <YAxis />
                                <Tooltip
                                    formatter={(value) => (value ? `₹${Number(value).toLocaleString()}` : '')}
                                    labelFormatter={(val) => {
                                        if (!val || typeof val !== 'string') return ''
                                        const d = new Date(val + 'T00:00:00')
                                        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    name="Revenue"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </Section>

                <Section title="Recent Activity">
                    {recentLogs.length > 0 ? (
                        <div className={styles.activityList}>
                            {recentLogs.map((log) => (
                                <div key={log.id} className={styles.activityItem}>
                                    <div className={styles.activityDot} />
                                    <div className={styles.activityContent}>
                                        <p className={styles.activityDesc}>{log.description}</p>
                                        <span className={styles.activityMeta}>
                                            {log.performedByRole} &middot;{' '}
                                            {new Date(log.createdAt).toLocaleString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.placeholder}>No recent activity.</div>
                    )}
                </Section>
            </div>

            <div className={styles.chartRow}>
                <Section title="Recent Registrations">
                    {overview && (
                        <table className={styles.userTable}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {overview.recentUsers.map((u) => (
                                    <tr key={u._id}>
                                        <td className={styles.userName}>{u.name}</td>
                                        <td>
                                            <span className={`${styles.roleBadge} ${styles[u.role]}`}>{u.role}</span>
                                        </td>
                                        <td className={styles.dateCell}>
                                            {new Date(u.createdAt).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Section>
                <Section title="Pending Verification">
                    {overview && overview.pendingVerifications.length > 0 ? (
                        <table className={styles.userTable}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Requested</th>
                                </tr>
                            </thead>
                            <tbody>
                                {overview.pendingVerifications.map((u) => (
                                    <tr key={u._id}>
                                        <td className={styles.userName}>{u.name}</td>
                                        <td>
                                            <span className={`${styles.roleBadge} ${styles[u.role]}`}>{u.role}</span>
                                        </td>
                                        <td className={styles.dateCell}>
                                            {new Date(u.createdAt).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className={styles.placeholder}>No pending verifications.</div>
                    )}
                </Section>
            </div>
        </div>
    )
}

export default AdminDashboard
