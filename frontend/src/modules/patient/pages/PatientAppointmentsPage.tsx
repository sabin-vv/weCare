import { Calendar, Clock, User, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

import { getPatientAppointments } from '../api/patient.api'
import { type Appointment } from '../types/patient.types'

import styles from './PatientAppointmentsPage.module.css'

import AuthLayout from '@/layout/AuthLayout'
import { getErrorMessage } from '@/utils/getErrorMessage'


const PatientAppointmentsPage = () => {
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

    const currentAppointments = appointments.filter((app) => {
        const appDate = new Date(app.appointmentDate)
        return appDate >= new Date(now.setHours(0, 0, 0, 0)) && app.status !== 'completed' && app.status !== 'cancelled'
    })

    const recentAppointments = appointments.filter((app) => {
        const appDate = new Date(app.appointmentDate)
        return appDate < new Date(now.setHours(0, 0, 0, 0)) || app.status === 'completed' || app.status === 'cancelled'
    })

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'confirmed': return styles.statusConfirmed
            case 'pending_payment': return styles.statusPending
            case 'cancelled': return styles.statusCancelled
            default: return ''
        }
    }

    if (isLoading) {
        return (
            <AuthLayout>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                </div>
            </AuthLayout>
        )
    }

    const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
        <div className={styles.appointmentCard}>
            <div className={styles.cardHeader}>
                <div className={styles.doctorInfo}>
                    <div className={styles.icon}><User size={24} /></div>
                    <div>
                        <div className={styles.doctorName}>{appointment.doctorId.name}</div>
                        <div className={styles.doctorEmail}>{appointment.doctorId.email}</div>
                    </div>
                </div>
                <div className={`${styles.statusBadge} ${getStatusClass(appointment.status)}`}>
                    {appointment.status}
                </div>
            </div>

            <div className={styles.appointmentDetails}>
                <div className={styles.detailRow}>
                    <Calendar size={18} className={styles.icon} />
                    <span>{new Date(appointment.appointmentDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</span>
                </div>
                <div className={styles.detailRow}>
                    <Clock size={18} className={styles.icon} />
                    <span>{appointment.slotStart}</span>
                </div>
                <div className={styles.detailRow}>
                    <CreditCard size={18} className={styles.icon} />
                    <span>Payment: <strong>{appointment.paymentStatus}</strong></span>
                </div>
            </div>

            <div className={styles.cardFooter}>
                <div className={styles.amount}>₹{appointment.amount}</div>
                {appointment.paymentStatus === 'paid' && (
                    <div className={styles.statusConfirmed} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                        <CheckCircle2 size={16} /> Paid
                    </div>
                )}
            </div>
        </div>
    )

    return (
        <AuthLayout>
            <div className={styles.container}>
                <h1 className={styles.title}>My Appointments</h1>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Clock size={24} /> Current Appointments
                    </h2>
                    {currentAppointments.length > 0 ? (
                        <div className={styles.grid}>
                            {currentAppointments.map((app) => (
                                <AppointmentCard key={app._id} appointment={app} />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>No upcoming appointments</div>
                    )}
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <AlertCircle size={24} /> Recent & Past Appointments
                    </h2>
                    {recentAppointments.length > 0 ? (
                        <div className={styles.grid}>
                            {recentAppointments.map((app) => (
                                <AppointmentCard key={app._id} appointment={app} />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>No past appointments found</div>
                    )}
                </section>
            </div>
        </AuthLayout>
    )
}

export default PatientAppointmentsPage
