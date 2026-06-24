import { X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { getAdminAppointments } from '../api/admin.api'
import type { AdminAppointment } from '../types/admin.types'

import styles from './AdminAppointmentsPage.module.css'

import DatePicker from '@/shared/components/DatePicker/DatePicker'
import Pagination from '@/shared/components/Pagination/Pagination'
import SearchField from '@/shared/components/SearchField/SearchField'
import SelectField from '@/shared/components/SelectField/SelectField'
import DataTable from '@/shared/components/Table/DataTable'
import type { Column } from '@/shared/components/Table/dataTable.types'
import { getErrorMessage } from '@/utils/getErrorMessage'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending_payment', label: 'Pending Payment' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_consultation', label: 'In Consultation' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'missed', label: 'Missed' },
]

const STATUS_BADGE: Record<string, string> = {
    pending_payment: styles.badgePending,
    confirmed: styles.badgeConfirmed,
    in_consultation: styles.badgeConsultation,
    completed: styles.badgeCompleted,
    cancelled: styles.badgeCancelled,
    missed: styles.badgeMissed,
}

const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const statusLabel = (status: AdminAppointment['status']) =>
    status
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')

const PaymentBadge = ({ status }: { status?: string }) => {
    if (!status) return <span className={styles.paymentNone}>—</span>
    const cls =
        status === 'success'
            ? styles.paymentSuccess
            : status === 'failed' || status === 'refunded'
                ? styles.paymentFailed
                : styles.paymentPending
    return <span className={`${styles.paymentBadge} ${cls}`}>{status}</span>
}

const Avatar = ({ name, image }: { name: string; image?: string }) => {
    const [hasError, setHasError] = useState(false)
    const initials = name
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    if (!image || hasError) return <div className={styles.avatarFallback}>{initials}</div>
    return <img src={image} alt={name} className={styles.avatarImg} onError={() => setHasError(true)} />
}

const columns: Column<AdminAppointment>[] = [
    {
        header: 'Patient',
        key: 'patientName',
        render: (item) => (
            <div className={styles.userCell}>
                <Avatar name={item.patientName} image={item.patientProfileImage} />
                <div className={styles.userInfo}>
                    <span className={styles.userName}>{item.patientName}</span>
                    <span className={styles.userEmail}>{item.patientEmail}</span>
                </div>
            </div>
        ),
    },
    {
        header: 'Doctor',
        key: 'doctorName',
        render: (item) => (
            <div className={styles.userCell}>
                <Avatar name={item.doctorName} image={item.doctorProfileImage} />
                <div className={styles.userInfo}>
                    <span className={styles.userName}>{item.doctorName}</span>
                    <span className={styles.userEmail}>{item.specialization}</span>
                </div>
            </div>
        ),
    },
    {
        header: 'Date',
        key: 'appointmentDate',
        render: (item) => <span className={styles.dateCell}>{formatDate(item.appointmentDate)}</span>,
    },
    {
        header: 'Time',
        key: 'slotStart',
        render: (item) => (
            <span className={styles.timeCell}>
                {item.slotStart} - {item.slotEnd}
            </span>
        ),
    },
    {
        header: 'Status',
        key: 'status',
        render: (item) => (
            <span className={`${styles.statusBadge} ${STATUS_BADGE[item.status] || ''}`}>
                {statusLabel(item.status)}
            </span>
        ),
    },
    {
        header: 'Payment',
        key: 'paymentStatus',
        render: (item) => <PaymentBadge status={item.paymentStatus} />,
    },
    {
        header: 'Created',
        key: 'createdAt',
        render: (item) => <span className={styles.dateCell}>{formatDate(item.createdAt)}</span>,
    },
]

const initialFilters = {
    search: '',
    status: 'all',
    startDate: '',
    endDate: '',
}

const AdminAppointmentsPage = () => {
    const [appointments, setAppointments] = useState<AdminAppointment[]>([])
    const [pagination, setPagination] = useState({ page: 1, limit: 8, totalCount: 0, totalPages: 1 })
    const [filters, setFilters] = useState(initialFilters)
    const [loading, setLoading] = useState(true)

    const fetchAppointments = useCallback(
        async (page: number) => {
            setLoading(true)
            try {
                const data = await getAdminAppointments(
                    page,
                    pagination.limit,
                    filters.search || undefined,
                    filters.status,
                    filters.startDate || undefined,
                    filters.endDate || undefined,
                )
                setAppointments(data.appointments)
                setPagination(data.pagination)
            } catch (error) {
                toast.error(getErrorMessage(error))
                setAppointments([])
            } finally {
                setLoading(false)
            }
        },
        [filters, pagination.limit],
    )

    useEffect(() => {
        fetchAppointments(1)
    }, [fetchAppointments])

    const updateFilter = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setFilters(initialFilters)
    }

    const hasActiveFilters = Object.values(filters).some((v) => v !== '' && v !== 'all')

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Appointments</h1>
                <p className={styles.subtitle}>View and manage all platform appointments</p>
            </div>

            <div className={styles.filterSection}>
                <div className={styles.searchRow}>
                    <SearchField
                        placeholder="Search by patient or doctor name/email..."
                        value={filters.search}
                        onChange={(value) => updateFilter('search', value)}
                    />
                    {hasActiveFilters && (
                        <button className={styles.clearBtn} onClick={clearFilters} type="button">
                            Clear
                            <X size={16} />
                        </button>
                    )}
                </div>
                <div className={styles.filterRow}>
                    <div className={styles.filterItem}>
                        <SelectField
                            options={STATUS_OPTIONS}
                            value={filters.status}
                            onChange={(e) => updateFilter('status', e.target.value)}
                        />
                    </div>
                    <div className={styles.filterItem}>
                        <DatePicker
                            value={filters.startDate}
                            onChange={(v) => updateFilter('startDate', v)}
                            placeholder="Start Date"
                            maxDate={filters.endDate ? new Date(filters.endDate + 'T00:00:00') : new Date()}
                        />
                    </div>
                    <div className={styles.filterItem}>
                        <DatePicker
                            value={filters.endDate}
                            onChange={(v) => updateFilter('endDate', v)}
                            placeholder="End Date"
                            minDate={filters.startDate ? new Date(filters.startDate + 'T00:00:00') : undefined}
                            maxDate={new Date()}
                        />
                    </div>
                </div>
            </div>

            <DataTable data={appointments} columns={columns} keyExtractor={(item) => item.appointmentId} isLoading={loading}>
                {appointments.length > 0 && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalCount={pagination.totalCount}
                        limit={pagination.limit}
                        onPageChange={(page) => fetchAppointments(page)}
                    />
                )}
            </DataTable>
        </div>
    )
}

export default AdminAppointmentsPage
