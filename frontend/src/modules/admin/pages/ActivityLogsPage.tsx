import { X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { getActivityLogs } from '../api/admin.api'
import type { ActivityLogFilters } from '../types/admin.types'
import type { ActivityLogEntry } from '../types/admin.types'

import styles from './ActivityLogsPage.module.css'

import DatePicker from '@/shared/components/DatePicker/DatePicker'
import Pagination from '@/shared/components/Pagination/Pagination'
import SearchField from '@/shared/components/SearchField/SearchField'
import SelectField from '@/shared/components/SelectField/SelectField'
import DataTable from '@/shared/components/Table/DataTable'
import type { Column } from '@/shared/components/Table/dataTable.types'

const ROLE_OPTIONS = [
    { value: '', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'caregiver', label: 'Caregiver' },
    { value: 'patient', label: 'Patient' },
]

const CATEGORY_OPTIONS = [
    { value: '', label: 'All Categories' },
    { value: 'user_management', label: 'User Management' },
    { value: 'verification', label: 'Verification' },
    { value: 'appointment', label: 'Appointment' },
    { value: 'payment', label: 'Payment' },
    { value: 'platform_settings', label: 'Platform Settings' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'alert', label: 'Alert' },
    { value: 'subscription', label: 'Subscription' },
    { value: 'system', label: 'System' },
]

const TARGET_TYPE_OPTIONS = [
    { value: '', label: 'All Targets' },
    { value: 'user', label: 'User' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'caregiver', label: 'Caregiver' },
    { value: 'patient', label: 'Patient' },
    { value: 'appointment', label: 'Appointment' },
    { value: 'payment', label: 'Payment' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'platform_setting', label: 'Platform Setting' },
    { value: 'alert', label: 'Alert' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'subscription', label: 'Subscription' },
]

const formatTimestamp = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const columns: Column<ActivityLogEntry>[] = [
    {
        header: 'Date & Time',
        key: 'createdAt',
        render: (item) => <span className={styles.timestamp}>{formatTimestamp(item.createdAt)}</span>,
    },
    {
        header: 'Performed By',
        key: 'performedByRole',
        render: (item) => (
            <span className={styles.userCell}>{item.performedByRole ? item.performedByRole : 'System'}</span>
        ),
    },
    {
        header: 'Category',
        key: 'category',
        render: (item) => <span className={styles.badge}>{item.category.replace(/_/g, ' ')}</span>,
    },
    {
        header: 'Action',
        key: 'action',
        render: (item) => item.action.replace(/_/g, ' '),
    },
    {
        header: 'Description',
        key: 'description',
    },
]

const initialFilters: ActivityLogFilters = {
    category: '',
    performedByRole: '',
    targetType: '',
    search: '',
    startDate: '',
    endDate: '',
}

const ActivityLogsPage = () => {
    const [logs, setLogs] = useState<ActivityLogEntry[]>([])
    const [pagination, setPagination] = useState({ page: 1, limit: 20, totalCount: 0, totalPages: 1 })
    const [filters, setFilters] = useState<ActivityLogFilters>(initialFilters)
    const [loading, setLoading] = useState(true)

    const fetchLogs = useCallback(
        async (page: number) => {
            setLoading(true)
            try {
                const activeFilters: ActivityLogFilters = {}
                for (const [key, value] of Object.entries(filters)) {
                    if (value) activeFilters[key as keyof ActivityLogFilters] = value
                }
                const res = await getActivityLogs(page, pagination.limit, activeFilters)
                setLogs(res.data)
                setPagination(res.pagination)
            } catch {
                setLogs([])
            } finally {
                setLoading(false)
            }
        },
        [filters, pagination.limit],
    )

    useEffect(() => {
        fetchLogs(1)
    }, [fetchLogs])

    const updateFilter = (key: keyof ActivityLogFilters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setFilters(initialFilters)
    }

    const hasActiveFilters = Object.values(filters).some((v) => v !== '')

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Activity Logs</h1>
                <p className={styles.subtitle}>Track all system-wide actions and changes</p>
            </div>

            <div className={styles.filterSection}>
                <div className={styles.searchRow}>
                    <SearchField
                        placeholder="Search descriptions..."
                        value={filters.search!}
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
                            options={ROLE_OPTIONS}
                            value={filters.performedByRole}
                            onChange={(e) => updateFilter('performedByRole', e.target.value)}
                        />
                    </div>
                    <div className={styles.filterItem}>
                        <SelectField
                            options={CATEGORY_OPTIONS}
                            value={filters.category}
                            onChange={(e) => updateFilter('category', e.target.value)}
                        />
                    </div>
                    <div className={styles.filterItem}>
                        <SelectField
                            options={TARGET_TYPE_OPTIONS}
                            value={filters.targetType}
                            onChange={(e) => updateFilter('targetType', e.target.value)}
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

            <DataTable data={logs} columns={columns} keyExtractor={(item) => item.id} isLoading={loading}>
                {logs.length > 0 && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalCount={pagination.totalCount}
                        limit={pagination.limit}
                        onPageChange={(page) => fetchLogs(page)}
                    />
                )}
            </DataTable>
        </div>
    )
}

export default ActivityLogsPage
