import { Activity, Bell, Calendar, CheckCircle2, Clock, Droplet, Heart, Pill, Wind, XCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import {
    cancelSubscription,
    createSubscription,
    getCareTeam,
    getMyAlertCount,
    getPatientAppointments,
    getPatientMedications,
    getPatientPrescriptions,
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
    type CareTeamMember,
    type MedicationSchedule,
    type PatientProfileData,
    type Prescription,
    type SubscriptionData,
    type VitalSchedule,
} from '../types/patient.types'

import styles from './PatientDashboardPage.module.css'

import { getPlatformSettings } from '@/modules/admin/api/admin.api'
import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import { Section } from '@/shared/components/Section/Section'
import { useAuth } from '@/shared/context/AuthContext'
import { useNotifications } from '@/shared/hooks/useNotifications'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { loadRazorpayScript } from '@/utils/loadRazorpay'

const DEFAULT_SUBSCRIPTION_AMOUNT = 25000

const vitalIcons: Record<string, typeof Heart> = {
    heart_rate: Heart,
    blood_pressure: Activity,
    blood_sugar: Droplet,
    spo2: Wind,
}

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
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
    const [patient, setPatient] = useState<PatientProfileData | null>(null)
    const [careTeam, setCareTeam] = useState<CareTeamMember[]>([])
    const [alertCount, setAlertCount] = useState(0)
    const { user } = useAuth()
    const { notifications } = useNotifications()

    const navigate = useNavigate()

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

                const [alertCountData, careTeamData] = await Promise.all([getMyAlertCount(), getCareTeam()])
                setAlertCount(alertCountData)
                setCareTeam(careTeamData)

                if (subscriptionData?.status === 'active') {
                    const [medicationsData, vitalSchedulesData, prescriptionsData] = await Promise.all([
                        getPatientMedications(),
                        getPatientVitalSchedules(),
                        getPatientPrescriptions(patientData.patientMongoId),
                    ])
                    setMedications(medicationsData)
                    setVitalSchedules(vitalSchedulesData)
                    setPrescriptions(prescriptionsData)
                }
            } catch (err) {
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
                        window.location.reload()
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

    const formatTime = (date: string): string => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })
    }

    const formatNotificationTime = (date: string): string => {
        const d = new Date(date)
        const now = new Date()
        const diffMs = now.getTime() - d.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours}h ago`
        const diffDays = Math.floor(diffHours / 24)
        return `${diffDays}d ago`
    }

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
            </div>
        )
    }

    const activeAppointments = appointments.filter((a) => ['confirmed', 'in_consultation'].includes(a.status))
    const nextAppointment = activeAppointments.length > 0 ? activeAppointments[0] : null

    const pendingMedsCount = medications.filter((m) => m.status === 'pending').length
    const activeRxCount = prescriptions.filter((p) => p.status === 'active').length

    const hour = new Date().getHours()
    let timePeriod = ''
    if (hour >= 5 && hour < 12) timePeriod = 'Morning'
    else if (hour >= 12 && hour < 17) timePeriod = 'Afternoon'
    else if (hour >= 17 && hour < 21) timePeriod = 'Evening'
    else timePeriod = 'Night'

    const hasActiveSubscription = subscription?.status === 'active'
    const hasCaregiverId = !!patient?.caregiverId

    const groupedVitals: Map<string, VitalSchedule[]> = new Map()
    for (const vs of vitalSchedules) {
        const existing = groupedVitals.get(vs.vitalType) || []
        existing.push(vs)
        groupedVitals.set(vs.vitalType, existing)
    }
    for (const [, schedules] of groupedVitals) {
        schedules.sort((a, b) => new Date(a.scheduleTime).getTime() - new Date(b.scheduleTime).getTime())
    }

    return (
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
                        <span className={styles.caregiverName}>{subscription.caregiver?.name || 'No Caregiver'}</span>
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

            {hasCaregiverId && subscription === null && (
                <>
                    <div className={styles.subscriptionBanner}>
                        <div className={styles.leftSection}>
                            <div className={styles.content}>
                                <h2 className={styles.title}>Caregiver Assigned & Ready</h2>
                                <p className={styles.description}>
                                    Your doctor has assigned a dedicated caregiver to manage your daily health needs. To
                                    activate your personalized care plan, please complete the monthly subscription
                                    payment.
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

            <div className={styles.summaryCards}>
                <div className={styles.summaryCard}>
                    <div className={`${styles.summaryIcon} ${styles.summaryIconAppointments}`}>
                        <Calendar size={20} />
                    </div>
                    <div className={styles.summaryInfo}>
                        <span className={styles.summaryValue}>{activeAppointments.length}</span>
                        <span className={styles.summaryLabel}>Upcoming Appointments</span>
                    </div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={`${styles.summaryIcon} ${styles.summaryIconMedications}`}>
                        <Pill size={20} />
                    </div>
                    <div className={styles.summaryInfo}>
                        <span className={styles.summaryValue}>{pendingMedsCount}</span>
                        <span className={styles.summaryLabel}>Medications Due Today</span>
                    </div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={`${styles.summaryIcon} ${styles.summaryIconPrescriptions}`}>
                        <Activity size={20} />
                    </div>
                    <div className={styles.summaryInfo}>
                        <span className={styles.summaryValue}>{activeRxCount}</span>
                        <span className={styles.summaryLabel}>Active Prescriptions</span>
                    </div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={`${styles.summaryIcon} ${styles.summaryIconAlerts}`}>
                        <Bell size={20} />
                    </div>
                    <div className={styles.summaryInfo}>
                        <span className={styles.summaryValue}>{alertCount}</span>
                        <span className={styles.summaryLabel}>Active Alerts</span>
                    </div>
                </div>
            </div>

            {hasActiveSubscription && nextAppointment && (
                <Section title="Upcoming Appointment">
                    <AppointmentCard
                        date={formatDate(nextAppointment.appointmentDate)}
                        doctorName={nextAppointment.doctorId.userId.name}
                        time={nextAppointment.slotStart}
                        status={nextAppointment.status}
                    />
                </Section>
            )}

            {hasActiveSubscription && medications.length > 0 && (
                <Section title="Today's Medications">
                    <div className={styles.medicationList}>
                        {[...medications]
                            .sort((a, b) => new Date(a.scheduleTime).getTime() - new Date(b.scheduleTime).getTime())
                            .map((med) => {
                                const timeStr = formatTime(med.scheduleTime)
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
                                            <span className={`${styles.medicationStatus} ${styles[med.status]}`}>
                                                {med.status}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                    </div>
                </Section>
            )}

            {hasActiveSubscription && groupedVitals.size > 0 && (
                <Section title="Today's Vitals">
                    <div className={styles.vitalGroupList}>
                        {Array.from(groupedVitals.entries()).map(([vitalType, schedules]) => {
                            const Icon = vitalIcons[vitalType] || Activity
                            const label = vitalType.replace(/_/g, ' ')
                            return (
                                <div key={vitalType} className={styles.vitalGroup}>
                                    <div className={styles.vitalGroupHeader}>
                                        <Icon size={18} className={styles.vitalGroupIcon} />
                                        <span className={styles.vitalGroupLabel}>
                                            {label.charAt(0).toUpperCase() + label.slice(1)}
                                        </span>
                                    </div>
                                    <div className={styles.vitalGroupItems}>
                                        {schedules.map((s) => {
                                            const st = formatTime(s.scheduleTime)
                                            const isRecorded = s.status === 'recorded'
                                            const isPending = s.status === 'pending'
                                            const isMissed = s.status === 'missed'
                                            const getValue = () => {
                                                const rv = s.recordedValue
                                                if (!rv) return ''
                                                switch (s.vitalType) {
                                                    case 'blood_pressure':
                                                        return ` ${rv.systolic || '--'}/${rv.diastolic || '--'}`
                                                    default:
                                                        return rv.value ? ` ${rv.value}` : ''
                                                }
                                            }
                                            return (
                                                <div
                                                    key={s._id}
                                                    className={`${styles.vitalGroupItem} ${
                                                        isRecorded
                                                            ? styles.vitalGroupItemRecorded
                                                            : isPending
                                                              ? styles.vitalGroupItemPending
                                                              : styles.vitalGroupItemMissed
                                                    }`}
                                                >
                                                    <span className={styles.vitalGroupItemTime}>{st}</span>
                                                    {isRecorded && (
                                                        <>
                                                            <CheckCircle2
                                                                size={14}
                                                                className={styles.vitalStatusRecorded}
                                                            />
                                                            <span className={styles.vitalStatusRecorded}>
                                                                {getValue()}
                                                            </span>
                                                        </>
                                                    )}
                                                    {isPending && (
                                                        <>
                                                            <Clock size={14} className={styles.vitalStatusPending} />
                                                            <span className={styles.vitalStatusPending}>Pending</span>
                                                        </>
                                                    )}
                                                    {isMissed && (
                                                        <>
                                                            <XCircle size={14} className={styles.vitalStatusMissed} />
                                                            <span className={styles.vitalStatusMissed}>Missed</span>
                                                        </>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Section>
            )}

            {hasActiveSubscription && prescriptions.filter((p) => p.status === 'active').length > 0 && (
                <Section title="Active Prescriptions">
                    <div className={styles.prescriptionList}>
                        {prescriptions
                            .filter((p) => p.status === 'active')
                            .map((rx) => (
                                <div key={rx._id} className={styles.prescriptionCard}>
                                    <div className={styles.prescriptionHeader}>
                                        <span className={`${styles.prescriptionStatus} ${styles[rx.status]}`}>
                                            {rx.status.replace(/_/g, ' ')}
                                        </span>
                                        <span className={styles.prescriptionDate}>
                                            {new Date(rx.prescribedAt).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <div className={styles.prescriptionBody}>
                                        <span className={styles.prescriptionDoctor}>
                                            Dr. {rx.prescribedBy?.userId?.name || 'Unknown'}
                                        </span>
                                        <span className={styles.prescriptionMeds}>
                                            {rx.medications.map((m) => `${m.name} - ${m.dosage}`)}
                                        </span>
                                    </div>
                                    {rx.note && <div className={styles.prescriptionNote}>{rx.note}</div>}
                                </div>
                            ))}
                    </div>
                </Section>
            )}

            {careTeam.length > 0 && (
                <Section title="Care Team">
                    <div className={styles.careTeamList}>
                        {careTeam.map((member) => (
                            <div key={member.id} className={styles.careTeamCard}>
                                <div className={styles.careTeamLeft}>
                                    <div className={styles.careTeamAvatar}>{member.name.charAt(0)}</div>
                                    <div className={styles.careTeamInfo}>
                                        <span className={styles.careTeamName}>{member.name}</span>
                                        <span className={styles.careTeamRole}>
                                            {member.role === 'doctor' ? 'Doctor' : 'Caregiver'}
                                        </span>
                                        {member.specialization && member.specialization.length > 0 && (
                                            <span className={styles.careTeamSpecialty}>
                                                {member.specialization.join(', ')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {member.myRating ? (
                                    <span className={styles.careTeamRating}>★ {member.myRating}</span>
                                ) : (
                                    <span
                                        className={styles.careTeamProvideRating}
                                        onClick={() => navigate('/care-team')}
                                    >
                                        Provide Feedback
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            <Section title="Recent Notifications">
                {notifications.length > 0 ? (
                    <div className={styles.notificationList}>
                        {notifications.slice(0, 5).map((n) => (
                            <div key={n._id} className={`${styles.notificationItem} ${!n.isRead ? styles.unread : ''}`}>
                                <div className={styles.notificationDot}>
                                    {!n.isRead && <div className={styles.unreadDot}></div>}
                                </div>
                                <div className={styles.notificationContent}>
                                    <span className={styles.notificationTitle}>{n.title}</span>
                                    <span className={styles.notificationMessage}>{n.message}</span>
                                </div>
                                <span className={styles.notificationTime}>{formatNotificationTime(n.createdAt)}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.emptyText}>No notifications</p>
                )}
            </Section>

            {nextAppointment === null && !hasActiveSubscription && (
                <div className={styles.noAppointments}>
                    <p>No active appointments</p>
                    <p>Book an appointment with a doctor to get started</p>
                </div>
            )}
        </MainWrapper>
    )
}

export default PatientDashboardPage
