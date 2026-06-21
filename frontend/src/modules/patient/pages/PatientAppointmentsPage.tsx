import { Clock, AlertCircle, Calendar, CreditCard, HandCoins } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { cancelAppointment, getPatientAppointments, getWallet, retryPayment, verifyPayment } from '../api/patient.api'
import PaymentMethodModal from '../component/PaymentMethodModal'
import { type Appointment, type CancelModalContentProps } from '../types/patient.types'

import styles from './PatientAppointmentsPage.module.css'

import { env } from '@/config/env'
import PatientLayout from '@/layout/PatientLayout'
import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import Modal from '@/shared/components/Modal/Modal'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { loadRazorpayScript } from '@/utils/loadRazorpay'

const CANCELLATION_REASONS = ['Schedule conflict', 'Feeling better', 'Emergency', 'Financial reasons', 'Other']

const CancelModalContent = ({
    cancellationReason,
    setCancellationReason,
    customReason,
    setCustomReason,
}: CancelModalContentProps) => {
    return (
        <div className={styles.cancelModalContent}>
            <p className={styles.cancelModalText}>Please select a reason for cancelling this appointment:</p>
            <div className={styles.reasonsList}>
                {CANCELLATION_REASONS.map((reason) => (
                    <label key={reason} className={styles.reasonOption}>
                        <input
                            type="radio"
                            name="cancellationReason"
                            value={reason}
                            checked={cancellationReason === reason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            className={styles.reasonRadio}
                        />
                        <span className={styles.reasonLabel}>{reason}</span>
                    </label>
                ))}
            </div>
            {cancellationReason === 'Other' && (
                <textarea
                    className={styles.customReasonTextarea}
                    placeholder="Please specify your reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    rows={3}
                    autoFocus
                />
            )}
        </div>
    )
}

const PatientAppointmentsPage = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
    const [cancellationReason, setCancellationReason] = useState('')
    const [customReason, setCustomReason] = useState('')
    const [isCancelling, setIsCancelling] = useState(false)

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [selectedRetryAppointment, setSelectedRetryAppointment] = useState<Appointment | null>(null)
    const [walletBalance, setWalletBalance] = useState<number>(0)

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

    useEffect(() => {
        if (isPaymentModalOpen) {
            getWallet()
                .then((data) => setWalletBalance(data.data.balance))
                .catch(() => setWalletBalance(0))
        }
    }, [isPaymentModalOpen])

    const handleRetryPayment = (appointment: Appointment) => {
        setSelectedRetryAppointment(appointment)
        setIsPaymentModalOpen(true)
    }

    const handleRazorpayPayment = async () => {
        if (!selectedRetryAppointment) return

        try {
            setIsPaymentModalOpen(false)

            await loadRazorpayScript()

            const response = await retryPayment(selectedRetryAppointment._id, 'razorpay')

            if (response.paymentMethod !== 'razorpay') {
                throw new Error('Unexpected response')
            }

            const { order, paymentId } = response

            const options = {
                key: env.RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'WeCare',
                description: `Appointment payment`,
                order_id: order.id,
                handler: async (razorpayResponse: {
                    razorpay_order_id: string
                    razorpay_payment_id: string
                    razorpay_signature: string
                }) => {
                    try {
                        await verifyPayment({
                            paymentId,
                            razorpayOrderId: razorpayResponse.razorpay_order_id,
                            razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                            razorpaySignature: razorpayResponse.razorpay_signature,
                        })
                        toast.success('Payment successful!')
                        const data = await getPatientAppointments()
                        setAppointments(data)
                    } catch (err) {
                        toast.error(getErrorMessage(err))
                    }
                },
                prefill: {},
                theme: { color: '#007bff' },
            }

            const rzp = new window.Razorpay(options)
            rzp.open()
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const handleWalletPayment = async () => {
        if (!selectedRetryAppointment) return

        try {
            setIsPaymentModalOpen(false)

            const response = await retryPayment(selectedRetryAppointment._id, 'wallet')

            if (response.paymentMethod !== 'wallet') {
                throw new Error('Unexpected response')
            }

            toast.success('Payment successful!')
            const data = await getPatientAppointments()
            setAppointments(data)
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const closePaymentModal = () => {
        setIsPaymentModalOpen(false)
        setSelectedRetryAppointment(null)
    }

    const handleAppointmentCancel = (id: string) => {
        setSelectedAppointmentId(id)
        setCancellationReason('')
        setCustomReason('')
        setIsCancelModalOpen(true)
    }

    const handleConfirmCancel = async () => {
        if (!selectedAppointmentId || !cancellationReason) return
        if (cancellationReason === 'Other' && !customReason.trim()) return

        const reason = cancellationReason === 'Other' ? customReason.trim() : cancellationReason
        setIsCancelling(true)
        try {
            const res = await cancelAppointment(selectedAppointmentId, reason)
            toast.success(res.message)
            setIsCancelModalOpen(false)
            const data = await getPatientAppointments()
            setAppointments(data)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsCancelling(false)
        }
    }

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

    const cancelModalFooter = (
        <>
            <button className={styles.modalCancelBtn} onClick={() => setIsCancelModalOpen(false)}>
                Go Back
            </button>
            <button
                className={styles.modalConfirmBtn}
                onClick={handleConfirmCancel}
                disabled={
                    !cancellationReason || (cancellationReason === 'Other' && !customReason.trim()) || isCancelling
                }
            >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
            </button>
        </>
    )

    if (isLoading) {
        return (
            <PatientLayout>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                </div>
            </PatientLayout>
        )
    }

    const getInitials = (name: string) =>
        name
            .split(' ')
            .map((p) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()

    const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
        const navigate = useNavigate()
        const appointmentTime = new Date(appointment.appointmentDate).getTime()
        const currentTime = Date.now()

        const diffInHours = (appointmentTime - currentTime) / (1000 * 60 * 60)

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
                                src={
                                    profileImage.startsWith('http')
                                        ? profileImage
                                        : `${env.AWS_BASE_URL}${profileImage}`
                                }
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
                                <button className={styles.retryButton} onClick={() => handleRetryPayment(appointment)}>
                                    Retry Payment
                                </button>
                            ) : (
                                canCancel && (
                                    <button
                                        className={styles.cancelButton}
                                        onClick={() => handleAppointmentCancel(appointment._id)}
                                    >
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

    return (
        <PatientLayout>
            <MainWrapper>
                <h1 className={styles.title}>My Appointments</h1>

                {currentAppointments.length > 0 ? (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <Clock size={24} /> Current Appointments
                        </h2>
                        <div className={styles.grid}>
                            {currentAppointments.map((app) => (
                                <AppointmentCard key={app._id} appointment={app} />
                            ))}
                        </div>
                    </section>
                ) : (
                    <div className={styles.emptyState}>No upcoming appointments</div>
                )}

                {recentAppointments.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <AlertCircle size={24} /> Recent & Past Appointments
                        </h2>
                        <div className={styles.grid}>
                            {recentAppointments.map((app) => (
                                <AppointmentCard key={app._id} appointment={app} />
                            ))}
                        </div>
                    </section>
                )}
            </MainWrapper>
            <Modal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                title="Cancel Appointment"
                footer={cancelModalFooter}
                size="sm"
            >
                <CancelModalContent
                    cancellationReason={cancellationReason}
                    setCancellationReason={setCancellationReason}
                    customReason={customReason}
                    setCustomReason={setCustomReason}
                />
            </Modal>

            <PaymentMethodModal
                isOpen={isPaymentModalOpen}
                onClose={closePaymentModal}
                amount={selectedRetryAppointment?.amount ?? 0}
                onSelectRazorpay={handleRazorpayPayment}
                onSelectWallet={handleWalletPayment}
                walletBalance={walletBalance}
            />
        </PatientLayout>
    )
}

export default PatientAppointmentsPage
