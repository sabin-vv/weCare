import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useParams, useNavigate } from 'react-router-dom'

import {
    getDoctorSlots,
    createAppointment,
    verifyPayment,
    getWallet,
    getAppointmentById,
    rescheduleAppointment,
} from '../api/patient.api'
import { type Appointment, type DoctorInfo, type DoctorSlot, type RazorpayResponse } from '../types/patient.types'

import styles from './DoctorAvailabilityPage.module.css'

import { env } from '@/config/env'
import { api } from '@/services/api'
import Button from '@/shared/components/Button/Button'
import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import { Section } from '@/shared/components/Section/Section'
import { useAuth } from '@/shared/context/AuthContext'
import { usePlatform } from '@/shared/context/PlatformContext'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { loadRazorpayScript } from '@/utils/loadRazorpay'

const SLOT_BUFFER_MINUTES = 15

const isSlotInPast = (slot: DoctorSlot, date: Date) => {
    const cutoff = new Date(Date.now() + SLOT_BUFFER_MINUTES * 60 * 1000)
    const [h, m] = slot.start.split(':').map(Number)
    const slotDate = new Date(date)
    slotDate.setHours(h, m, 0, 0)
    return slotDate < cutoff
}

const isToday = (date: Date) => date.toDateString() === new Date().toDateString()

const DoctorAvailabilityPage = () => {
    const { doctorId, appointmentId } = useParams<{ doctorId: string; appointmentId: string }>()
    const [doctor, setDoctor] = useState<DoctorInfo | null>(null)
    const [appointment, setAppointment] = useState<Appointment>()

    const [slots, setSlots] = useState<DoctorSlot[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [isProcessingPayment, setIsProcessingPayment] = useState(false)
    const [walletbalance, setWalletbalance] = useState<number>(0)
    const [isFetchingSlots, setIsFetchingSlots] = useState(false)
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<Omit<DoctorSlot, 'available'>>({
        start: '',
        end: '',
    })
    const { settings } = usePlatform()
    const { user } = useAuth()
    const navigate = useNavigate()

    const fetchWallet = async () => {
        const res = await getWallet()
        setWalletbalance(res.data.balance)
    }

    const formatDate = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const fetchSlots = async (date: Date) => {
        try {
            setIsFetchingSlots(true)
            const data = await getDoctorSlots(doctorId!, formatDate(date))
            setSlots(data.slots)
        } catch (err) {
            toast.error(getErrorMessage(err))
            setSlots([])
        } finally {
            setIsFetchingSlots(false)
        }
    }

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                if (appointmentId) {
                    const data = await getAppointmentById(appointmentId)
                    setAppointment(data)
                }

                const res = await api.get(`/doctors/${doctorId}`)

                setDoctor(res.data.data)

                setSelectedDate(new Date())
            } catch (err) {
                toast.error(getErrorMessage(err))
            } finally {
                setIsLoading(false)
            }
        }

        if (doctorId) fetchDoctor()
    }, [doctorId, appointmentId])

    useEffect(() => {
        if (doctorId && selectedDate) {
            fetchSlots(selectedDate)
            setSelectedTimeSlot({ start: '', end: '' })
        }
    }, [selectedDate, doctorId])

    useEffect(() => {
        if (user) fetchWallet()
    }, [])

    const groupSlots = (slots: DoctorSlot[]) => ({
        morning: slots.filter((s) => Number(s.start.split(':')[0]) < 12),
        afternoon: slots.filter((s) => {
            const hour = Number(s.start.split(':')[0])
            return hour >= 12 && hour < 17
        }),
        evening: slots.filter((s) => Number(s.start.split(':')[0]) >= 17),
    })

    const visibleSlots =
        selectedDate && isToday(selectedDate) ? slots.filter((slot) => !isSlotInPast(slot, selectedDate)) : slots
    const groupedSlots = groupSlots(visibleSlots)

    const validateCheckout = () => {
        if (!selectedTimeSlot || !selectedDate) {
            toast.error('Please select a date and time slot')
            return false
        }

        return true
    }

    const handleRazorpayAppointment = async () => {
        if (!validateCheckout()) return
        if (!selectedDate) return
        if (!user) {
            toast.error('Please login first')
            return
        }

        const appointmentDate = selectedDate.toISOString()

        try {
            setIsProcessingPayment(true)

            await loadRazorpayScript()

            const response = await createAppointment({
                doctorId: doctorId!,
                appointmentDate,
                paymentMethod: 'razorpay',
                slotStart: selectedTimeSlot.start,
                slotEnd: selectedTimeSlot.end,
            })

            if (response.paymentMethod !== 'razorpay') {
                throw new Error('Unexpected wallet response for Razorpay checkout')
            }

            const { order, paymentId } = response

            const options = {
                key: env.RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'WeCare',
                description: `Appointment with ${doctor?.name}`,
                order_id: order.id,
                handler: async (response: RazorpayResponse) => {
                    try {
                        await verifyPayment({
                            paymentId,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        })
                        toast.success('Appointment booked successfully!')
                        setIsProcessingPayment(false)
                        navigate('/appointments')
                    } catch (err) {
                        toast.error(getErrorMessage(err))
                        setIsProcessingPayment(false)
                    }
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: user?.mobile || '',
                },
                theme: {
                    color: '#007bff',
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessingPayment(false)
                    },
                },
            }

            const rzp = new window.Razorpay(options)

            await loadRazorpayScript().catch(() => {
                toast.error('Payment service unavailable')
                setIsProcessingPayment(false)
                throw new Error('Razorpay load failed')
            })

            rzp.open()
        } catch (err) {
            toast.error(getErrorMessage(err))
            setIsProcessingPayment(false)
        }
    }

    const handleWalletAppointment = async () => {
        if (!validateCheckout()) return
        if (!selectedDate) return

        const appointmentDate = selectedDate.toISOString()

        if (totalFee > walletbalance) {
            toast.error('Insufficient wallet balance')
            return
        }

        try {
            setIsProcessingPayment(true)

            const response = await createAppointment({
                doctorId: doctorId!,
                appointmentDate,
                paymentMethod: 'wallet',
                slotStart: selectedTimeSlot.start,
                slotEnd: selectedTimeSlot.end,
            })

            if (response.paymentMethod !== 'wallet') {
                throw new Error('Unexpected Razorpay response for wallet checkout')
            }

            setWalletbalance(response.walletBalance)
            toast.success('Appointment booked successfully')
            navigate('/appointments')
        } catch (err) {
            toast.error(getErrorMessage(err))
            await fetchWallet().catch(() => null)
        } finally {
            setIsProcessingPayment(false)
        }
    }

    const handleReSchedule = async () => {
        if (!appointmentId || !selectedDate || !selectedTimeSlot.start) return

        const appointmentDate = selectedDate.toISOString()
        const slotStart = selectedTimeSlot.start
        const slotEnd = selectedTimeSlot.end

        try {
            setIsProcessingPayment(true)
            await rescheduleAppointment(appointmentId, {
                appointmentDate,
                slotStart,
                slotEnd,
            })
            toast.success('Schedule Updated')
            navigate('/appointments')
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsProcessingPayment(false)
        }
    }

    const totalFee = (doctor?.consultationFee ?? 0) + (settings?.platformFee ?? 0)
    const canCheckout = Boolean(selectedDate && selectedTimeSlot.start && !isFetchingSlots && !isProcessingPayment)
    const hasInsufficientWalletBalance = totalFee > walletbalance

    const doctorInitials =
        doctor?.name
            ?.split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || ''

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
            </div>
        )
    }

    if (!doctor) {
        return (
            <main>
                <div className={styles.errorContainer}>
                    <p>Doctor not found</p>
                    <button onClick={() => navigate('/appointments')} className={styles.backButton}>
                        Back to Doctors
                    </button>
                </div>
            </main>
        )
    }

    return (
        <MainWrapper
            title="Select Slot and Payment"
            subtitle="Choose a date, reserve a time that works for you, and complete checkout when you're ready."
        >
            <main className={styles.main}>
                <Section>
                    <h2 className={styles.sectionTitle}>Select Appointment Date & Time</h2>

                    <div className={styles.miniDoctorCard}>
                        {doctor?.profileImage ? (
                            <img
                                src={
                                    doctor.profileImage.startsWith('http')
                                        ? doctor.profileImage
                                        : `${env.AWS_BASE_URL}${doctor.profileImage}`
                                }
                                alt={doctor.name}
                                className={styles.miniDoctorImage}
                            />
                        ) : (
                            <div className={styles.avatarPlaceholder}>{doctorInitials}</div>
                        )}

                        <div>
                            <h4>{doctor?.name}</h4>
                            <p className={styles.doctorSpeciality}>{doctor?.professionalTitle}</p>
                        </div>
                    </div>

                    <div className={styles.dateRow}>
                        {[...Array(7)].map((_, i) => {
                            const date = new Date()
                            date.setDate(date.getDate() + i)

                            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()

                            return (
                                <button
                                    key={i}
                                    className={`${styles.dateCard} ${isSelected ? styles.activeDate : ''}`}
                                    onClick={() => setSelectedDate(date)}
                                >
                                    <span>{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                    <strong>{date.getDate()}</strong>
                                    <small>{date.toLocaleDateString('en-US', { month: 'short' })}</small>
                                </button>
                            )
                        })}
                    </div>

                    {slots.length === 0 ? (
                        <div className={styles.noSlots}>No slots available for this date</div>
                    ) : (
                        Object.entries(groupedSlots).map(([label, slots]) => {
                            if (!slots || slots.length === 0) return null

                            return (
                                <div key={label} className={styles.slotSection}>
                                    <p className={styles.timeSlotCategory}>{label}</p>

                                    <div className={styles.timeSlotsGrid}>
                                        {slots.map((slot) => (
                                            <button
                                                key={slot.start}
                                                disabled={!slot.available}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedTimeSlot({ start: slot.start, end: slot.end })
                                                }
                                                className={[
                                                    styles.timeSlot,
                                                    selectedTimeSlot.start === slot.start ? styles.selected : '',
                                                    !slot.available ? styles.unavailable : '',
                                                ]
                                                    .filter(Boolean)
                                                    .join(' ')}
                                            >
                                                {slot.start}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </Section>

                <Section>
                    <div className={styles.bookingSummary}>
                        <h2 className={styles.sectionTitle}>Booking Summary</h2>

                        <div className={styles.doctorInfo}>
                            <div>
                                <h3 className={styles.doctorName}>{doctor?.name}</h3>
                                <p className={styles.doctorSpeciality}>{doctor?.professionalTitle}</p>
                            </div>
                        </div>

                        <hr className={styles.divider} />

                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Date</span>
                            <span className={styles.infoValue}>
                                {selectedDate?.toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>

                        <hr className={styles.divider} />

                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Time Slot</span>
                            <span className={styles.infoValue}>
                                {selectedTimeSlot.start
                                    ? `${selectedTimeSlot.start} - ${selectedTimeSlot.end}`
                                    : 'Not selected'}
                            </span>
                        </div>

                        <hr className={styles.divider} />

                        {appointment ? (
                            <div>
                                <Button disabled={!canCheckout} onClick={handleReSchedule}>
                                    Update Schedule
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className={styles.feeRow}>
                                    <span>Consultation Fee</span>
                                    <span>₹{doctor?.consultationFee.toLocaleString()}</span>
                                </div>

                                <div className={styles.feeRow}>
                                    <span>Platform Fee</span>
                                    <span>₹{settings?.platformFee}</span>
                                </div>

                                <hr className={styles.divider} />

                                <div className={styles.totalRow}>
                                    <span>Total</span>
                                    <span>₹{totalFee.toLocaleString()}</span>
                                </div>

                                <div className={styles.canellationPolicyWarning}>
                                    <p>
                                        Please review the cancellation policy carefully before proceeding with payment.
                                    </p>
                                </div>

                                <div className={styles.paymentMethods}>
                                    <Button
                                        onClick={handleRazorpayAppointment}
                                        disabled={!canCheckout}
                                        isLoading={isProcessingPayment}
                                    >
                                        Pay with Razorpay
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        disabled={!canCheckout || hasInsufficientWalletBalance}
                                        className={styles.walletButton}
                                        onClick={handleWalletAppointment}
                                    >
                                        Wallet (₹{walletbalance.toLocaleString()})
                                    </Button>
                                    {hasInsufficientWalletBalance ? (
                                        <p className={styles.paymentHint}>
                                            Add money to your wallet to complete this booking.
                                        </p>
                                    ) : null}
                                </div>
                            </>
                        )}
                    </div>
                </Section>
            </main>
            <div className={styles.cancellationPolicy}>
                <h4 className={styles.cancellationPolicyTitle}>Cancellation Policy</h4>
                <ul className={styles.cancellationPolicyList}>
                    <li>
                        Appointments cancelled more than 24 hours before the scheduled consultation time are eligible
                        for a full refund of the consultation fee.
                    </li>
                    <li>
                        Appointments cancelled between 2 and 24 hours before the scheduled consultation time are
                        eligible for a 50% refund of the consultation fee.
                    </li>
                    <li>
                        Appointments cancelled within 2 hours of the scheduled consultation time are non-refundable.
                    </li>
                    <li>Platform fees are non-refundable under all circumstances.</li>
                    <li>Eligible refunds will be credited to your wallet after the cancellation is processed.</li>
                </ul>
            </div>
        </MainWrapper>
    )
}

export default DoctorAvailabilityPage
