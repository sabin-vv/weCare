import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

import { getPatientAppointments } from '../api/patient.api'
import AppointmentCard from '../component/AppointmentCard'
import { type Appointment } from '../types/patient.types'

import styles from './PatientDashboardPage.module.css'

import AuthLayout from '@/layout/AuthLayout'
import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import { getErrorMessage } from '@/utils/getErrorMessage'

const PatientDashboardPage = () => {
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
            <AuthLayout>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                </div>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout>
            <MainWrapper>
                {appointments.map((appointment) => (
                    <AppointmentCard
                        key={appointment._id}
                        date={formatDate(appointment.appointmentDate)}
                        doctorName={appointment.doctorId.name}
                        specialization={appointment.doctorId.email}
                        status="pending_payment"
                        time={appointment.slotStart}
                    />
                ))}
            </MainWrapper>
        </AuthLayout>
    )
}

export default PatientDashboardPage
