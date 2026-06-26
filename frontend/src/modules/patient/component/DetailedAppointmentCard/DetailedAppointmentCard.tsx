import { Calendar, Clock, CreditCard, HandCoins } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { Appointment } from '../../types/patient.types'

import styles from './DetailedAppointmentCard.module.css'

import { env } from '@/config/env'

interface DetailedAppointmentCardProps {
    appointment: Appointment
    onRetryPayment: (appointment: Appointment) => void
    onCancel: (appointmentId: string) => void
}

const getStatusClass = (status: string) => {
    switch (status) {
        case 'confirmed':
            return styles.statusConfirmed
        case 'pending_payment':
            return styles.statusPending
        case 'cancelled':
            return styles.statusCancelled
        case 'in_consultation':
            return styles.inConsultation
        case 'completed':
            return styles.completed
        default:
            return ''
    }
}

const getInitials = (name: string) =>
    name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

const DetailedAppointmentCard = ({ appointment, onRetryPayment, onCancel }: DetailedAppointmentCardProps) => {
    const navigate = useNavigate()
    const appointmentDateTime = new Date(appointment.appointmentDate)
    const [hours, minutes] = (appointment.slotStart || '00:00').split(':').map(Number)
    appointmentDateTime.setHours(hours, minutes, 0, 0)
    const diffInHours = (appointmentDateTime.getTime() - Date.now()) / (1000 * 60 * 60)

    const canCancel = diffInHours > 2 && appointment.status === 'confirmed'
    const canRetryPayment = appointment.status === 'pending_payment' && appointment.paymentStatus === 'pending'
    const doctorName = appointment.doctorId.userId.name
    const doctorId = appointment.doctorId._id
    const profileImage = appointment.doctorId.profileImage
    const isTerminal = appointment.status === 'cancelled' || appointment.status === 'completed'

    return (
        <div className={styles.appointmentCard}>
            <div className={styles.cardTopRow}>
                <div className={styles.doctorDetails}>
                    {profileImage ? (
                        <img
                            src={profileImage.startsWith('http') ? profileImage : `${env.AWS_BASE_URL}${profileImage}`}
                            alt={doctorName}
                            className={styles.profilePic}
                        />
                    ) : (
                        <div className={styles.avatarPlaceholder} style={{ background: '#dbeafe' }}>
                            {getInitials(doctorName)}
                        </div>
                    )}

                    <div className={styles.doctorInfo}>
                        <div className={styles.nameRow}>
                            <span className={styles.doctorName}>Dr. {doctorName}</span>
                        </div>
                        <div className={styles.specialtyRow}>
                            <span className={styles.doctorSpecialize}>
                                {appointment.doctorId.specializations.map((s) => s.name).join(', ')}
                            </span>
                        </div>
                        <span className={styles.appointmentId}>Appointment ID: {appointment.appointmentId}</span>
                    </div>
                </div>

                <span className={`${styles.statusText} ${getStatusClass(appointment.status)}`}>
                    {appointment.status.replace('_', ' ')}
                </span>
            </div>

            <div className={styles.detailsRow}>
                <div className={styles.detailItem}>
                    <span className={styles.detailValue}>
                        <Calendar size={18} /> Date
                    </span>
                    {new Date(appointment.appointmentDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                        day: 'numeric',
                        weekday: 'short',
                    })}
                </div>
                <span className={styles.detailsSeparator}>|</span>
                <div className={styles.detailItem}>
                    <span className={styles.detailValue}>
                        <Clock size={18} /> Time
                    </span>{' '}
                    {appointment.slotStart} – {appointment.slotEnd}
                </div>
                <span className={styles.detailsSeparator}>|</span>
                <div className={styles.detailItem}>
                    <span className={styles.detailValue}>
                        <CreditCard size={18} /> Payment Status
                    </span>
                    <span className={styles.paymentStatus}>{appointment.paymentStatus}</span>
                </div>
                <span className={styles.detailsSeparator}>|</span>
                <div className={styles.detailItem}>
                    <span className={styles.detailValue}>
                        <HandCoins size={18} /> Amount
                    </span>
                    ₹ {appointment.amount.toLocaleString()}
                </div>
            </div>

            <div className={styles.cardFooter}>
                <div className={styles.footerLeft}>
                    {appointment.cancelledBy && (
                        <span>
                            <strong>Cancelled By:</strong> {appointment.cancelledBy}
                        </span>
                    )}
                    {appointment.cancellationReason && (
                        <span>
                            <strong>Reason:</strong> {appointment.cancellationReason}
                        </span>
                    )}
                </div>
                {isTerminal ? (
                    <div className={styles.footerRight}>
                        <button
                            className={styles.bookAgainButton}
                            onClick={() => navigate(`/doctors/${appointment.doctorId._id}`)}
                        >
                            Book Again
                        </button>
                    </div>
                ) : (
                    <div className={styles.footerRight}>
                        {appointment.status === 'confirmed' && (
                            <button
                                className={styles.rescheduleButton}
                                onClick={() => navigate(`/doctors/${doctorId}/reschedule/${appointment._id}`)}
                            >
                                Reschedule
                            </button>
                        )}
                        {canRetryPayment ? (
                            <button className={styles.retryButton} onClick={() => onRetryPayment(appointment)}>
                                Retry Payment
                            </button>
                        ) : (
                            canCancel && (
                                <button className={styles.cancelButton} onClick={() => onCancel(appointment._id)}>
                                    Cancel
                                </button>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default DetailedAppointmentCard
