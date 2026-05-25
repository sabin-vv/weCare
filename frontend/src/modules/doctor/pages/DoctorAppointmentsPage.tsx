import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { getDoctorAppointments } from '../api/doctor.api'
import type { DoctorAppointment } from '../types/doctor.types'

import styles from './DoctorAppointmentsPage.module.css'

import DoctorLayout from '@/layout/DoctorLayout'
import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import SearchField from '@/shared/components/SearchField/SearchField'
import DataTable from '@/shared/components/Table/DataTable'
import type { Column } from '@/shared/components/Table/dataTable.types'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { getFileUrl } from '@/utils/getFileUrl'

const CONSULTATION_STATUS_OPTIONS = [
    { label: 'All', value: 'all' },
    { label: 'Pending Consultation', value: 'confirmed' },
    { label: 'In Consultation', value: 'in_consultation' },
    { label: 'Completed', value: 'completed' },
] as const

const DoctorAppointmentsPage = () => {
    const [appointments, setAppointments] = useState<DoctorAppointment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [consultationStatus, setConsultationStatus] = useState('all')
    const navigate = useNavigate()

    useEffect(() => {
        const fetchAppointments = async () => {
            setIsLoading(true)
            try {
                const data = await getDoctorAppointments()
                setAppointments(data)
            } catch (error) {
                toast.error(getErrorMessage(error))
            } finally {
                setIsLoading(false)
            }
        }

        fetchAppointments()
    }, [])

    const formatAppointmentStatusLabel = (status: DoctorAppointment['status']) => {
        if (status === 'confirmed') return 'Pending Consultation'
        if (status === 'in_consultation') return 'In Consultation'

        return status
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    const formatAppointmentDate = (value: string) => {
        return new Date(value).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    const filteredAppointments = appointments.filter((appointment) => {
        if (
            appointment.status === 'cancelled' ||
            appointment.status === 'pending_payment' ||
            appointment.status === 'missed'
        ) {
            return false
        }

        const normalizedSearch = search.trim().toLowerCase()

        const matchesSearch =
            !normalizedSearch ||
            appointment.patientId.name.toLowerCase().includes(normalizedSearch) ||
            appointment.patientId.email.toLowerCase().includes(normalizedSearch)

        const matchesConsultationStatus = consultationStatus === 'all' || appointment.status === consultationStatus

        return matchesSearch && matchesConsultationStatus
    })

    const PatientAvatar = ({ name, profileImage }: { name?: string; profileImage?: string }) => {
        const [hasError, setHasError] = useState(false)
        const imageUrl = profileImage ? getFileUrl(profileImage) : ''
        const safeName = name?.trim() || 'Unknown Patient'
        if (!imageUrl || hasError) {
            const initials = safeName
                .split(' ')
                .filter(Boolean)
                .map((p) => p[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            return <div className={styles.avatarFallback}>{initials}</div>
        }
        return <img src={imageUrl} alt={safeName} className={styles.avatarImage} onError={() => setHasError(true)} />
    }

    const columns: Column<DoctorAppointment>[] = [
        {
            header: 'Patient',
            key: 'patientId',
            render: (item) => (
                <div className={styles.patientCell}>
                    <PatientAvatar name={item.patientId?.name} profileImage={item.patientId?.profileImage} />
                    <div className={styles.patientInfo}>
                        <span className={styles.patientName}>{item.patientId.name}</span>
                        <span className={styles.patientEmail}>{item.patientId.email}</span>
                    </div>
                </div>
            ),
        },
        {
            header: 'Date',
            key: 'appointmentDate',
            render: (item) => <span>{formatAppointmentDate(item.appointmentDate)}</span>,
        },
        {
            header: 'Time',
            key: 'slotStart',
            render: (item) => (
                <span>
                    {item.slotStart} - {item.slotEnd}
                </span>
            ),
        },
        {
            header: 'Consultation Status',
            key: 'status',
            render: (item) => (
                <span className={`${styles.badge} ${styles[item.status]}`}>
                    {formatAppointmentStatusLabel(item.status)}
                </span>
            ),
        },
        {
            header: 'Action',
            key: '_id',
            render: (item) => (
                <button className={styles.viewBtn} onClick={() => navigate(`/doctor/appointments/${item._id}`)}>
                    View
                </button>
            ),
        },
    ]

    return (
        <DoctorLayout>
            <MainWrapper title="Appointments" subtitle="Track consultations and payment progress">
                <div className={styles.filterSection}>
                    <div className={styles.searchWrapper}>
                        <SearchField
                            value={search}
                            onSearch={setSearch}
                            placeholder="Search by patient name or email..."
                        />
                    </div>
                    <div className={styles.filtersWrapper}>
                        <div className={styles.filterGroup}>
                            <ul className={styles.filterList}>
                                {CONSULTATION_STATUS_OPTIONS.map((option) => (
                                    <li
                                        key={option.value}
                                        className={styles.filterItem}
                                        onClick={() => setConsultationStatus(option.value)}
                                        aria-current={consultationStatus === option.value}
                                    >
                                        {option.label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <DataTable
                    data={filteredAppointments}
                    columns={columns}
                    keyExtractor={(item) => item._id}
                    isLoading={isLoading}
                />
            </MainWrapper>
        </DoctorLayout>
    )
}

export default DoctorAppointmentsPage
