import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { listPatients } from '../api/doctor.api'
import type { Pagination as PaginationMeta, Patients } from '../types/doctor.types'

import styles from './PatientList.module.css'

import DoctorLayout from '@/layout/DoctorLayout'
import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import Pagination from '@/shared/components/Pagination/Pagination'
import SearchField from '@/shared/components/SearchField/SearchField'
import DataTable from '@/shared/components/Table/DataTable'
import type { Column } from '@/shared/components/Table/dataTable.types'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { getFileUrl } from '@/utils/getFileUrl'

const FILTER_OPTIONS = [
    { label: 'All', value: 'all' },
    { label: 'Pending Consultation', value: 'confirmed' },
    { label: 'In Consultation', value: 'in_consultation' },
    { label: 'Completed', value: 'completed' },
] as const

const getInitials = (name: string) => {
    return name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

const PatientAvatar = ({ name, profileImage }: { name: string; profileImage?: string }) => {
    const [hasImageError, setHasImageError] = useState(false)
    const imageUrl = profileImage ? getFileUrl(profileImage) : ''

    if (!imageUrl || hasImageError) {
        return <div className={styles.avatarFallback}>{getInitials(name)}</div>
    }

    return <img src={imageUrl} alt={name} className={styles.profileImage} onError={() => setHasImageError(true)} />
}

const PatientList = () => {
    const [search, setSearch] = useState<string>('')
    const [filter, setFilter] = useState('all')
    const [page, setPage] = useState(1)
    const [patients, setPatients] = useState<Patients[]>([])
    const [pagination, setPagination] = useState<PaginationMeta>({
        page: 1,
        limit: 10,
        totalCount: 0,
        totalPages: 1,
    })
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const navigate = useNavigate()

    useEffect(() => {
        const timer = setTimeout(() => {
            const fetchPatients = async () => {
                setIsLoading(true)
                try {
                    const response = await listPatients(search, filter, page, pagination.limit)
                    setPatients(response.patients)
                    setPagination(response.pagination)
                } catch (error) {
                    toast.error(getErrorMessage(error))
                } finally {
                    setIsLoading(false)
                }
            }

            fetchPatients()
        }, 300)

        return () => clearTimeout(timer)
    }, [search, filter, page, pagination.limit])

    useEffect(() => {
        setPage(1)
    }, [search, filter])

    const getRiskLevelClass = (riskLevel?: string) => {
        return riskLevel ? styles[riskLevel] : ''
    }

    const getStatusClass = (status?: string) => {
        return status ? styles[status] : ''
    }

    const formatStatusLabel = (status?: string) => {
        if (!status) return 'N/A'
        if (status === 'pending_consultation') return 'Pending Consultation'
        if (status === 'in_consultation') return 'In Consultation'
        if (status === 'confirmed') return 'Pending Consultation'
        if (status === 'completed') return 'Completed'

        return status
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    const columns: Column<Patients>[] = [
        {
            header: 'Patient',
            key: 'patientId',
            render: (item: Patients) => (
                <div className={styles.patientCell}>
                    <PatientAvatar name={item.name} profileImage={item.profileImage} />
                    <div className={styles.patientInfo}>
                        <span className={styles.patientName}>{item.name}</span>
                        <span className={styles.patientId}>#{item.patientId}</span>
                    </div>
                </div>
            ),
        },
        {
            header: 'Primary Condition',
            key: 'conditions',
            render: (item: Patients) => <span className={styles.condition}>{item.conditions?.[0] || 'N/A'}</span>,
        },
        {
            header: 'Risk Level',
            key: 'riskLevel',
            render: (item: Patients) => (
                <span className={`${styles.riskLevel} ${getRiskLevelClass(item.riskLevel)}`}>
                    {item.riskLevel || 'N/A'}
                </span>
            ),
        },
        {
            header: 'Caregiver',
            key: 'caregiver',
            render: (item: Patients) => <span className={styles.caregiver}>{item.caregiver || 'Unassigned'}</span>,
        },
        {
            header: 'Status',
            key: 'status',
            render: (item: Patients) => (
                <span className={`${styles.status} ${getStatusClass(item.status)}`}>
                    {formatStatusLabel(item.status)}
                </span>
            ),
        },
        {
            header: 'Action',
            key: 'patientId',
            render: (item: Patients) => (
                <button className={styles.actionBtn} onClick={() => navigate(`/doctor/patients/${item._id}`)}>
                    View
                </button>
            ),
        },
    ]

    return (
        <DoctorLayout>
            <MainWrapper title="Patient Directory" subtitle="Monitoring all patients">
                <div className={styles.filterSection}>
                    <div className={styles.searchWrapper}>
                        <SearchField value={search} onSearch={setSearch} />
                    </div>
                    <ul className={styles.filterList}>
                        {FILTER_OPTIONS.map((option) => (
                            <li
                                key={option.value}
                                className={styles.filterItem}
                                onClick={() => setFilter(option.value)}
                                aria-current={filter === option.value}
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>
                </div>
                <DataTable
                    data={patients}
                    columns={columns}
                    keyExtractor={(item) => item.patientId}
                    isLoading={isLoading}
                >
                    {!isLoading && patients.length > 0 && (
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            totalCount={pagination.totalCount}
                            limit={pagination.limit}
                            onPageChange={setPage}
                        />
                    )}
                </DataTable>
            </MainWrapper>
        </DoctorLayout>
    )
}
export default PatientList
