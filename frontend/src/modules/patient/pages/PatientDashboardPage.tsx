import { Activity, Droplet, Heart, Wind } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

import {
    cancelSubscription,
    createSubscription,
    getPatientAppointments,
    getPatientMedications,
    getPatientProfile,
    getPatientSubscription,
    getPatientVitalSchedules,
    getWallet,
    verifySubscriptionPayment,
} from '../api/patient.api'
import AppointmentCard from '../component/AppointmentCard'
import SubscriptionModal from '../component/SubscriptionModal'
import {
    type Appointment,
    type MedicationSchedule,
    type PatientProfileData,
    type SubscriptionData,
    type VitalSchedule,
} from '../types/patient.types'

import styles from './PatientDashboardPage.module.css'

import PatientLayout from '@/layout/PatientLayout'
import { getPlatformSettings } from '@/modules/admin/api/admin.api'
import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import { useAuth } from '@/shared/context/AuthContext'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { loadRazorpayScript } from '@/utils/loadRazorpay'

const DEFAULT_SUBSCRIPTION_AMOUNT = 25000

const PatientDashboardPage = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
    const [walletBalance, setWalletBalance] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
    const [subscriptionAmount, setSubscriptionAmount] = useState(DEFAULT_SUBSCRIPTION_AMOUNT)
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
    const [pendingSubscriptionId, setPendingSubscriptionId] = useState<string | null>(null)
    const [medications, setMedications] = useState<MedicationSchedule[]>([])
    const [vitalSchedules, setVitalSchedules] = useState<VitalSchedule[]>([])
    const [patient, setPatient] = useState<PatientProfileData | null>(null)
    const { user } = useAuth()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [appointmentsData, subscriptionData, walletData, settingsData, patientData] = await Promise.all([
                    getPatientAppointments(),
                    getPatientSubscription(),
                    getWallet(),
                    getPlatformSettings(),
                    getPatientProfile(),
                ])

                setPatient(patientData)
                setAppointments(appointmentsData)
                setSubscription(subscriptionData)
                setWalletBalance(walletData.data.balance)
                setSubscriptionAmount(settingsData.subscriptionFee || DEFAULT_SUBSCRIPTION_AMOUNT)
                setBillingCycle(settingsData.billingCycle || 'monthly')

                if (subscriptionData?.status === 'active') {
                    const [medicationsData, vitalData] = await Promise.all([
                        getPatientMedications(),
                        getPatientVitalSchedules(),
                    ])
                    setMedications(medicationsData)
                    setVitalSchedules(vitalData)
                }
            } catch (err) {
                console.error('Error fetching data:', err)
                toast.error(getErrorMessage(err))
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleOpenSubscriptionModal = () => {
        setIsSubscriptionModalOpen(true)
    }

    const handleCloseSubscriptionModal = () => {
        setIsSubscriptionModalOpen(false)
    }

    const handleRazorpaySubscription = async () => {
        try {
            const response = await createSubscription(billingCycle, 'razorpay')

            if ('subscriptionConfirmed' in response) {
                toast.success('Subscription activated successfully!')
                const updatedSubscription = await getPatientSubscription()
                setSubscription(updatedSubscription)
                return
            }

            setPendingSubscriptionId(response.subscriptionId)
            await loadRazorpayScript()

            const options = {
                key: response.keyId,
                amount: response.amount,
                currency: response.currency,
                name: 'WeCare',
                description: 'Caregiver subscription',
                order_id: response.orderId,
                handler: async (razorpayResponse: {
                    razorpay_order_id: string
                    razorpay_payment_id: string
                    razorpay_signature: string
                }) => {
                    setPendingSubscriptionId(null)
                    try {
                        const updatedSubscription = await verifySubscriptionPayment({
                            razorpayOrderId: razorpayResponse.razorpay_order_id,
                            razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                            razorpaySignature: razorpayResponse.razorpay_signature,
                        })
                        setSubscription(updatedSubscription)
                        toast.success('Subscription activated successfully!')
                    } catch (err) {
                        toast.error(getErrorMessage(err))
                    }
                },
                prefill: {},
                theme: { color: '#5f55ff' },
            }

            const rzp = new window.Razorpay(options)

            rzp.on('payment.failed', async (_origin, error) => {
                setPendingSubscriptionId(null)
                toast.error(`Payment failed: ${error.description}`)
                if (pendingSubscriptionId) {
                    await cancelSubscription(pendingSubscriptionId)
                    const updatedSubscription = await getPatientSubscription()
                    setSubscription(updatedSubscription)
                }
            })

            rzp.on('modal.closed', async () => {
                if (pendingSubscriptionId) {
                    await cancelSubscription(pendingSubscriptionId)
                    setPendingSubscriptionId(null)
                    const updatedSubscription = await getPatientSubscription()
                    setSubscription(updatedSubscription)
                }
            })

            rzp.open()
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const handleWalletSubscription = async () => {
        try {
            const response = await createSubscription(billingCycle, 'wallet')

            if ('subscriptionConfirmed' in response) {
                toast.success('Subscription activated successfully!')
                const updatedSubscription = await getPatientSubscription()
                setSubscription(updatedSubscription)
                setWalletBalance(response.walletBalance)
            }
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const formatDate = (date: string): string => {
        const newDate = new Date(date)
        return newDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    if (isLoading) {
        return (
            <PatientLayout>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                </div>
            </PatientLayout>
        )
    }

    const activeAppointments = appointments.filter((a) => ['confirmed', 'in_consultation'].includes(a.status))

    const hour = new Date().getHours()

    let timePeriod = ''

    if (hour >= 5 && hour < 12) {
        timePeriod = 'Morning'
    }

    if (hour >= 12 && hour < 17) {
        timePeriod = 'Afternoon'
    }

    if (hour >= 17 && hour < 21) {
        timePeriod = 'Evening'
    }
    const today = new Date()
    today.getDate()

    const hasActiveSubscription = subscription?.status === 'active'
    const hasScheduleContent = medications.length > 0 || vitalSchedules.length > 0
    const hasCaregiverId = !!patient?.caregiver

    return (
        <PatientLayout>
            <MainWrapper title={`Good ${timePeriod}, ${user?.name} `} subtitle="Here's your status Today.">
                {hasCaregiverId && subscription && subscription.status !== 'active' && (
                    <div className={styles.subscriptionCard}>
                        <div className={styles.subscriptionHeader}>
                            <span className={styles.subscriptionLabel}>Subscription</span>
                            <span className={`${styles.subscriptionStatus} ${styles[subscription.status]}`}>
                                {subscription.status}
                            </span>
                        </div>
                        <div className={styles.subscriptionInfo}>
                            <span className={styles.caregiverName}>
                                {subscription.caregiver?.name || 'No Caregiver'}
                            </span>
                            <span className={styles.dot}>•</span>
                            <span className={styles.billingCycle}>
                                {subscription.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
                            </span>
                            <span className={styles.dot}>•</span>
                            <span className={styles.fee}>₹{subscription.subscriptionFee}</span>
                        </div>
                        <div className={styles.subscriptionExpiry}>Ends: {formatDate(subscription.endDate)}</div>
                    </div>
                )}

                {hasActiveSubscription && hasScheduleContent && (
                    <div className={styles.scheduleSection}>
                        {vitalSchedules.length > 0 && (
                            <div className={styles.vitalSection}>
                                <h3 className={styles.sectionTitle}>Vitals</h3>
                                <div className={styles.vitalScroll}>
                                    {vitalSchedules.map((vital) => {
                                        const vitalLabel = vital.vitalType.replace(/_/g, ' ')
                                        const time = new Date(vital.scheduleTime)
                                        const timeStr = time.toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true,
                                        })
                                        const VitalIcon = () => {
                                            const iconProps = { size: 20 }
                                            switch (vital.vitalType) {
                                                case 'blood_pressure':
                                                    return <Activity {...iconProps} />
                                                case 'blood_sugar':
                                                    return <Droplet {...iconProps} />
                                                case 'heart_rate':
                                                    return <Heart {...iconProps} />
                                                case 'spo2':
                                                    return <Wind {...iconProps} />
                                                default:
                                                    return <Activity {...iconProps} />
                                            }
                                        }

                                        return (
                                            <div key={vital._id} className={styles.vitalCard}>
                                                <div className={styles.vitalIcon}>
                                                    <VitalIcon />
                                                </div>
                                                <div className={styles.vitalInfo}>
                                                    <span className={styles.vitalName}>
                                                        {vitalLabel.charAt(0).toUpperCase() + vitalLabel.slice(1)}
                                                    </span>
                                                    <span className={styles.vitalTime}>{timeStr}</span>
                                                </div>
                                                <span className={`${styles.vitalStatus} ${styles[vital.status]}`}>
                                                    {vital.status}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {medications.length > 0 && (
                            <>
                                <h3 className={styles.sectionTitle}>Medications</h3>
                                <span className={styles.showDate}>{today.toLocaleDateString()}</span>
                                <div className={styles.medicationList}>
                                    {[...medications]
                                        .sort((a, b) => {
                                            const timeA = new Date(a.scheduleTime).getTime()
                                            const timeB = new Date(b.scheduleTime).getTime()
                                            return timeA - timeB
                                        })
                                        .map((med) => {
                                            const time = new Date(med.scheduleTime)
                                            const timeStr = time.toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true,
                                            })
                                            return (
                                                <div key={med._id} className={styles.medicationCard}>
                                                    <div className={styles.medicationDetails}>
                                                        <span className={styles.medicineName}>{med.medicineName}</span>
                                                        <span className={styles.medicineDosage}>
                                                            {med.dosage} • {med.route}
                                                        </span>
                                                    </div>
                                                    <div className={styles.medicationRight}>
                                                        <span className={styles.medicationTime}>{timeStr}</span>
                                                        <span
                                                            className={`${styles.medicationStatus} ${styles[med.status]}`}
                                                        >
                                                            {med.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {hasCaregiverId && subscription === null && (
                    <>
                        <div className={styles.subscriptionBanner}>
                            <div className={styles.leftSection}>
                                <div className={styles.content}>
                                    <h2 className={styles.title}>Caregiver Assigned & Ready</h2>

                                    <p className={styles.description}>
                                        Your doctor has assigned a dedicated caregiver to manage your daily health
                                        needs. To activate your personalized care plan, please complete the monthly
                                        subscription payment.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.rightSection}>
                                <div className={styles.priceContainer}>
                                    <span className={styles.price}>₹{subscriptionAmount.toLocaleString()}</span>

                                    <span className={styles.duration}>
                                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                                    </span>
                                </div>

                                <button className={styles.payButton} onClick={handleOpenSubscriptionModal}>
                                    Subscribe
                                </button>
                            </div>
                        </div>

                        <SubscriptionModal
                            isOpen={isSubscriptionModalOpen}
                            onClose={handleCloseSubscriptionModal}
                            caregiverName={'Your Caregiver'}
                            amount={subscriptionAmount}
                            onSelectRazorpay={handleRazorpaySubscription}
                            onSelectWallet={handleWalletSubscription}
                            walletBalance={walletBalance}
                        />
                    </>
                )}

                {activeAppointments.length > 0 &&
                    activeAppointments.map((appointment) => (
                        <AppointmentCard
                            key={appointment._id}
                            date={formatDate(appointment.appointmentDate)}
                            doctorName={appointment.doctorId.userId.name}
                            time={appointment.slotStart}
                            status={appointment.status}
                        />
                    ))}

                {subscription === null && activeAppointments.length === 0 && (
                    <div className={styles.noAppointments}>
                        <p>No active appointments</p>
                        <p>Book an appointment with a doctor to get started</p>
                    </div>
                )}
            </MainWrapper>
        </PatientLayout>
    )
}

export default PatientDashboardPage
