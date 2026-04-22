import { Calendar, Clock, ChevronRight, LayoutDashboard, PlusCircle, Stethoscope } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

import { getPatientAppointments } from '../api/patient.api'
import { type Appointment } from '../types/patient.types'

import styles from './PatientDashboardPage.module.css'

import AuthLayout from '@/layout/AuthLayout'
import Button from '@/shared/components/Button/Button'
import { useAuth } from '@/shared/context/AuthContext'
import { getErrorMessage } from '@/utils/getErrorMessage'

const PatientDashboardPage = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const data = await getPatientAppointments()
                setAppointments(data)
            } catch (err) {
                console.error('Error fetching appointments:', err)
                toast.error(getErrorMessage(err))
            } finally {
                setIsLoading(false)
            }
        }

        fetchAppointments()
    }, [])

    const now = new Date()
    const activeAppointments = appointments.filter((app) => {
        const appDate = new Date(app.appointmentDate)

        const endOfToday = new Date()
        endOfToday.setHours(23, 59, 59, 999)

        return appDate >= new Date(now.setHours(0, 0, 0, 0)) && app.status !== 'completed' && app.status !== 'cancelled'
    })

    const nextAppointment = activeAppointments.length > 0 ? activeAppointments[activeAppointments.length - 1] : null

    if (isLoading) {
        return (
            <AuthLayout>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                </div>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.welcomeText}>Hello, {user?.name?.split(' ')[0]}!</h1>
                    <p className={styles.subtitle}>
                        Welcome back to WeCare. Here is an overview of your health schedule.
                    </p>
                </header>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <Calendar size={24} />
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{activeAppointments.length}</span>
                            <span className={styles.statLabel}>Active Bookings</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#fff0f6', color: '#d63384' }}>
                            <Clock size={24} />
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>
                                {nextAppointment ? nextAppointment.slotStart : '--:--'}
                            </span>
                            <span className={styles.statLabel}>Next Appointment</span>
                        </div>
                    </div>

                    <div className={styles.statCard} style={{ cursor: 'pointer' }} onClick={() => navigate('/doctors')}>
                        <div className={styles.statIcon} style={{ background: '#f0fff4', color: '#198754' }}>
                            <PlusCircle size={24} />
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>Book New</span>
                            <span className={styles.statLabel}>Find a Doctor</span>
                        </div>
                    </div>
                </div>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            <LayoutDashboard size={20} color="#007bff" /> Active Appointments
                        </h2>
                        <Link to="/appointments" className={styles.viewAllBtn}>
                            View All History
                        </Link>
                    </div>

                    <div className={styles.appointmentList}>
                        {activeAppointments.length > 0 ? (
                            activeAppointments.map((app) => (
                                <div key={app._id} className={styles.appointmentItem}>
                                    <div className={styles.doctorDetails}>
                                        <div className={styles.doctorAvatar}>{app.doctorId.name.charAt(0)}</div>
                                        <div>
                                            <span className={styles.doctorName}>Dr. {app.doctorId.name}</span>
                                            <div className={styles.dateTime}>
                                                <Calendar size={14} />
                                                {new Date(app.appointmentDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                                <span style={{ margin: '0 4px' }}>•</span>
                                                <Clock size={14} /> {app.slotStart}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`${styles.statusBadge} ${styles.statusConfirmed}`}>
                                        {app.status}
                                    </div>
                                    <ChevronRight size={20} color="#ccc" />
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <Stethoscope size={48} color="#e0e0e0" style={{ marginBottom: '1rem' }} />
                                <p>No active appointments found.</p>
                                <Button
                                    onClick={() => navigate('/doctors')}
                                    style={{ marginTop: '1rem' }}
                                    variant="secondary"
                                >
                                    Schedule One Now
                                </Button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </AuthLayout>
    )
}

export default PatientDashboardPage
