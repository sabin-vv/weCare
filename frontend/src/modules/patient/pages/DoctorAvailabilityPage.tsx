import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useParams, useNavigate } from 'react-router-dom'

import { getDoctorSlots, createAppointment, verifyPayment } from '../api/patient.api'
import { type DoctorSlot } from '../types/patient.types'

import styles from './DoctorAvailabilityPage.module.css'

import { env } from '@/config/env'
import AuthLayout from '@/layout/AuthLayout'
import { api } from '@/services/api'
import Button from '@/shared/components/Button/Button'
import { useAuth } from '@/shared/context/AuthContext'
import { usePlatform } from '@/shared/context/PlatformContext'
import { getErrorMessage } from '@/utils/getErrorMessage'

type DoctorInfo = {
    id: string
    fullName: string
    professionalTitle: string
    profileImage?: string
    initials: string
    accent: string
    consultationFee: number
}

const DoctorAvailabilityPage = () => {
    const { doctorId } = useParams<{ doctorId: string }>()
    const navigate = useNavigate()
    const [doctor, setDoctor] = useState<DoctorInfo | null>(null)

    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
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
                console.error('Error fetching doctor:', err)
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
            setSelectedTimeSlot(null)
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

            const order = await createAppointment({
                doctorId: doctorId!,
                appointmentDate: selectedDate,
                slotStart: selectedTimeSlot,
            })

            const options = {
                key: env.RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'WeCare',
                description: `Appointment with ${doctor?.fullName}`,
                order_id: order.id,
                handler: async (response: any) => {
                    try {
                        await verifyPayment({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        })
                        toast.success('Appointment booked successfully!')
                        navigate('/appointments')
                    } catch (err) {
                        console.error('Verification failed:', err)
                        toast.error('Payment verification failed. Please contact support.')
                    }
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    Contact: '',
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

            const rzp = new (window as any).Razorpay(options)
            rzp.open()
        } catch (err) {
            console.error('Booking failed:', err)
            toast.error(getErrorMessage(err))
            setLoading(false)
        }
    }

    const totalFee = (doctor?.consultationFee ?? 0) + (settings?.platformFee ?? 0)

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
                            <div className={styles.avatarPlaceholder}>{doctor?.initials}</div>
                        )}

                        <div>
                            <h4>{doctor?.fullName}</h4>
                            <p>{doctor?.professionalTitle}</p>
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
                                                onClick={() => setSelectedTimeSlot(slot.start)}
                                                className={`
              ${styles.timeSlot}
              ${selectedTimeSlot === slot.start ? styles.selected : ''}
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

                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>Doctor</span>
                            <span className={styles.summaryValue}>{doctor?.fullName}</span>
                        </div>

                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>Specialization</span>
                            <span className={styles.summaryValue}>{doctor?.professionalTitle}</span>
                        </div>

                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>Date</span>
                            <span className={styles.summaryValue}>
                                {selectedDate?.toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>

                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>Time</span>
                            <span className={styles.summaryValue}>{selectedTimeSlot || 'Not selected'}</span>
                        </div>

                        <div className={styles.totalRow}>
                            <span className={styles.totalLabel}>Consultation Fee</span>
                            <span className={styles.totalValue}>₹{doctor.consultationFee}</span>
                        </div>

                        <div className={styles.totalRow}>
                            <span className={styles.totalLabel}>Platform Fee</span>
                            <span className={styles.totalValue}>₹{settings?.platformFee}</span>
                        </div>

                        <div className={styles.totalRow}>
                            <span className={styles.totalLabel}>Total</span>
                            <span className={styles.totalValue}>₹{totalFee}</span>
                        </div>

                        <Button
                            onClick={handleBookAppointment}
                            disabled={!selectedDate || !selectedTimeSlot || loading}
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
