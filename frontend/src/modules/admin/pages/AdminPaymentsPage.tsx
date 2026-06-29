import { X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getAdminPayments } from '../api/admin.api'
import type { AdminPayment } from '../types/admin.types'

import styles from './AdminPaymentsPage.module.css'

import DateRangePicker from '@/shared/components/DateRangePicker/DateRangePicker'
import Pagination from '@/shared/components/Pagination/Pagination'
import SearchField from '@/shared/components/SearchField/SearchField'
import SelectField from '@/shared/components/SelectField/SelectField'
import DataTable from '@/shared/components/Table/DataTable'
import type { Column } from '@/shared/components/Table/dataTable.types'
import { getErrorMessage } from '@/utils/getErrorMessage'

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'success', label: 'Success' },
    { value: 'failed', label: 'Failed' },
    { value: 'refund_pending', label: 'Refund Pending' },
    { value: 'refunded', label: 'Refunded' },
]

const TYPE_OPTIONS = [
    { value: 'all', label: 'All Types' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'subscription', label: 'Subscription' },
]

const PAYMENT_STATUS_BADGE: Record<string, string> = {
    pending: styles.badgePending,
    success: styles.badgeSuccess,
    failed: styles.badgeFailed,
    refund_pending: styles.badgeRefundPending,
    refunded: styles.badgeRefunded,
}

const formatDate = (iso?: string) => {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString('en-IN')}`

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

const columns: Column<AdminPayment>[] = [
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
        header: 'Payment ID',
        key: 'paymentId',
        render: (item) => <span className={styles.idCell}>{item.paymentId.slice(-8).toUpperCase()}</span>,
    },
    {
        header: 'Type',
        key: 'paymentType',
        render: (item) => (
            <span className={styles.typeBadge}>
                {item.paymentType.charAt(0).toUpperCase() + item.paymentType.slice(1)}
            </span>
        ),
    },
    {
        header: 'Method',
        key: 'paymentMethod',
        render: (item) => (
            <span className={styles.methodBadge}>
                {item.paymentMethod === 'razorpay' ? 'Razorpay' : 'Wallet'}
            </span>
        ),
    },
    {
        header: 'Amount',
        key: 'totalAmount',
        render: (item) => <span className={styles.amountCell}>{formatCurrency(item.totalAmount)}</span>,
    },
    {
        header: 'Status',
        key: 'status',
        render: (item) => (
            <span className={`${styles.statusBadge} ${PAYMENT_STATUS_BADGE[item.status] || ''}`}>
                {item.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
        ),
    },
    {
        header: 'Date',
        key: 'createdAt',
        render: (item) => <span className={styles.dateCell}>{formatDate(item.createdAt)}</span>,
    },
]

const initialFilters = {
    search: '',
    status: 'all',
    paymentType: 'all',
    startDate: '',
    endDate: '',
}

const AdminPaymentsPage = () => {
    const [payments, setPayments] = useState<AdminPayment[]>([])
    const [pagination, setPagination] = useState({ page: 1, limit: 8, totalCount: 0, totalPages: 1 })
    const [filters, setFilters] = useState(initialFilters)
    const [loading, setLoading] = useState(true)

    const fetchPayments = useCallback(
        async (page: number) => {
            setLoading(true)
            try {
                const data = await getAdminPayments(
                    page,
                    pagination.limit,
                    filters.search || undefined,
                    filters.status,
                    filters.paymentType,
                    filters.startDate || undefined,
                    filters.endDate || undefined,
                )
                setPayments(data.payments)
                setPagination(data.pagination)
            } catch (error) {
                toast.error(getErrorMessage(error))
                setPayments([])
            } finally {
                setLoading(false)
            }
        },
        [filters, pagination.limit],
    )

    useEffect(() => {
        fetchPayments(1)
    }, [fetchPayments])

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
                <h1 className={styles.pageTitle}>Payments</h1>
                <p className={styles.subtitle}>View all platform payments and transactions</p>
            </div>

            <div className={styles.filterSection}>
                <div className={styles.searchRow}>
                    <SearchField
                        placeholder="Search by patient name or email..."
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
                        <SelectField
                            options={TYPE_OPTIONS}
                            value={filters.paymentType}
                            onChange={(e) => updateFilter('paymentType', e.target.value)}
                        />
                    </div>
                    <div className={styles.dateRangeItem}>
                        <DateRangePicker
                            value={{ start: filters.startDate, end: filters.endDate }}
                            onChange={(v) => setFilters((prev) => ({ ...prev, startDate: v.start, endDate: v.end }))}
                            maxDate={new Date()}
                        />
                    </div>
                </div>
            </div>

            <DataTable data={payments} columns={columns} keyExtractor={(item) => item.paymentId} isLoading={loading}>
                {payments.length > 0 && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalCount={pagination.totalCount}
                        limit={pagination.limit}
                        onPageChange={(page) => fetchPayments(page)}
                    />
                )}
            </DataTable>
        </div>
    )
}

export default AdminPaymentsPage
