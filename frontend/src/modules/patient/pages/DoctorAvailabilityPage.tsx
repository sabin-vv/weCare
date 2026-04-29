import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useParams, useNavigate } from 'react-router-dom'

import { getDoctorSlots, createAppointment, verifyPayment } from '../api/patient.api'
import { type DoctorInfo, type DoctorSlot, type RazorpayResponse } from '../types/patient.types'

import styles from './DoctorAvailabilityPage.module.css'

import { env } from '@/config/env'
import AuthLayout from '@/layout/AuthLayout'
import { api } from '@/services/api'
import Button from '@/shared/components/Button/Button'
import { useAuth } from '@/shared/context/AuthContext'
import { usePlatform } from '@/shared/context/PlatformContext'
import { getErrorMessage } from '@/utils/getErrorMessage'

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

const loadRazorpayScript = (): Promise<void> => {
    if (window.Razorpay) {
        return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
        if (window.Razorpay) {
            resolve()
            return
        }
        const script = document.createElement('script')
        script.src = RAZORPAY_SCRIPT_URL
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load Razorpay'))
        document.head.appendChild(script)
    })
}

declare global {
    interface Window {
        Razorpay: {
            new (options: unknown): {
                open(): void
            }
        }
    }
}

const DoctorAvailabilityPage = () => {
    const { doctorId } = useParams<{ doctorId: string }>()
    const navigate = useNavigate()
    const [doctor, setDoctor] = useState<DoctorInfo | null>(null)

    const [selectedTimeSlot, setSelectedTimeSlot] = useState<Omit<DoctorSlot, 'available'>>({
        start: '',
        end: '',
    })
    const [slots, setSlots] = useState<DoctorSlot[]>([])

    const [isLoading, setIsLoading] = useState(true)

    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    const [loading, setLoading] = useState(false)

    const { settings } = usePlatform()

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0]
    }

    const fetchSlots = async (date: Date) => {
        try {
            setLoading(true)
            const data = await getDoctorSlots(doctorId!, formatDate(date))
            setSlots(data.slots)
        } catch (err) {
            toast.error(getErrorMessage(err))
            setSlots([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
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
    }, [doctorId])

    useEffect(() => {
        if (doctorId && selectedDate) {
            fetchSlots(selectedDate)
            setSelectedTimeSlot({ start: '', end: '' })
        }
    }, [selectedDate, doctorId])

    const groupSlots = (slots: DoctorSlot[]) => ({
        morning: slots.filter((s) => Number(s.start.split(':')[0]) < 12),
        afternoon: slots.filter((s) => {
            const hour = Number(s.start.split(':')[0])
            return hour >= 12 && hour < 17
        }),
        evening: slots.filter((s) => Number(s.start.split(':')[0]) >= 17),
    })

    const groupedSlots = groupSlots(slots)

    const { user } = useAuth()

    const handleBookAppointment = async () => {
        if (!selectedTimeSlot || !selectedDate) {
            toast.error('Please select a date and time slot')
            return
        }
        if (!user) {
            toast.error('Please login to continue')
            return
        }

        try {
            setLoading(true)

            await loadRazorpayScript()

            const { order, paymentId } = await createAppointment({
                doctorId: doctorId!,
                appointmentDate: selectedDate.toISOString(),
                slotStart: selectedTimeSlot.start,
                slotEnd: selectedTimeSlot.end,
            })

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
                        setLoading(false)
                        navigate('/appointments')
                    } catch (err) {
                        toast.error(getErrorMessage(err))
                        setLoading(false)
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
                        setLoading(false)
                    },
                },
            }

            const rzp = new window.Razorpay(options)

            await loadRazorpayScript().catch(() => {
                toast.error('Payment service unavailable')
                setLoading(false)
                throw new Error('Razorpay load failed')
            })

            rzp.open()
        } catch (err) {
            toast.error(getErrorMessage(err))
            setLoading(false)
        }
    }

    const totalFee = (doctor?.consultationFee ?? 0) + (settings?.platformFee ?? 0)

    const doctorInitials =
        doctor?.name
            ?.split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || ''

    if (isLoading) {
        return (
            <AuthLayout>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                </div>
            </AuthLayout>
        )
    }

    if (!doctor) {
        return (
            <AuthLayout>
                <main>
                    <div className={styles.errorContainer}>
                        <p>Doctor not found</p>
                        <button onClick={() => navigate('/appointments')} className={styles.backButton}>
                            Back to Doctors
                        </button>
                    </div>
                </main>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout>
            <main className={styles.main}>
                <div className={styles.leftSection}>
                    <h2 className={styles.sectionTitle}>Select Appointment Date & Time</h2>

                    <div className={styles.miniDoctorCard}>
                        {doctor?.profileImage ? (
                            <img
                                src={
                                    doctor.profileImage.startsWith('http')
                                        ? doctor.profileImage
                                        : `${env.AWS_BASE_URL}${doctor.profileImage}`
                                }
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
                                                onClick={() =>
                                                    setSelectedTimeSlot({ start: slot.start, end: slot.end })
                                                }
                                                className={`
              ${styles.timeSlot}
              ${selectedTimeSlot.start === slot.start ? styles.selected : ''}
              ${!slot.available ? styles.unavailable : ''}
            `}
                                            >
                                                {slot.start}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                <div className={styles.rightSection}>
                    <div className={styles.bookingSummary}>
                        <h2 className={styles.sectionTitle}>Booking Summary</h2>

                        {/* Doctor Info (No Image) */}
                        <div className={styles.doctorInfo}>
                            <div>
                                <h3 className={styles.doctorName}>{doctor?.name}</h3>
                                <p className={styles.doctorSpeciality}>{doctor?.professionalTitle}</p>
                            </div>
                        </div>

                        <hr className={styles.divider} />

                        {/* Date */}
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

                        {/* Time */}
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Time Slot</span>
                            <span className={styles.infoValue}>{selectedTimeSlot.start || 'Not selected'}</span>
                        </div>

                        <hr className={styles.divider} />

                        {/* Fees */}
                        <div className={styles.feeRow}>
                            <span>Consultation Fee</span>
                            <span>₹{doctor?.consultationFee}</span>
                        </div>

                        <div className={styles.feeRow}>
                            <span>Platform Fee</span>
                            <span>₹{settings?.platformFee}</span>
                        </div>

                        <hr className={styles.divider} />

                        {/* Total */}
                        <div className={styles.totalRow}>
                            <span>Total</span>
                            <span>₹{totalFee}</span>
                        </div>

                        {/* Button */}
                        <Button
                            onClick={handleBookAppointment}
                            disabled={!selectedDate || !selectedTimeSlot.start || loading}
                        >
                            {loading ? 'Processing...' : 'Pay with Razorpay'}
                        </Button>
                    </div>
                </div>
            </main>
        </AuthLayout>
    )
}

export default DoctorAvailabilityPage
