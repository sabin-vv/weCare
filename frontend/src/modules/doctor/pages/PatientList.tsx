import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { listPatients } from '../api/doctor.api'
import type { PaginationData, Patients, RiskLevel } from '../types/doctor.types'

import styles from './PatientList.module.css'

import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import Pagination from '@/shared/components/Pagination/Pagination'
import SearchField from '@/shared/components/SearchField/SearchField'
import DataTable from '@/shared/components/Table/DataTable'
import type { Column } from '@/shared/components/Table/dataTable.types'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { getFileUrl } from '@/utils/getFileUrl'

const CLINICAL_STATUS_OPTIONS = [
    { label: 'All Accounts', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Hospitalized', value: 'hospitalized' },
    { label: 'Deceased', value: 'deceased' },
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
    const [clinicalStatus, setClinicalStatus] = useState('all')
    const [riskLevel, setRiskLevel] = useState('all')
    const [page, setPage] = useState(1)
    const [patients, setPatients] = useState<Patients[]>([])
    const [pagination, setPagination] = useState<PaginationData>({
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
                    const response = await listPatients(search, clinicalStatus, riskLevel, page, pagination.limit)
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
    }, [search, clinicalStatus, riskLevel, page, pagination.limit])

    useEffect(() => {
        setPage(1)
    }, [search, clinicalStatus, riskLevel])

    const getRiskLevelClass = (riskLevel?: string) => {
        return riskLevel ? styles[riskLevel] : ''
    }

    const getStatusClass = (status?: string) => {
        return status ? styles[status] : ''
    }

    const formatAccountStatusLabel = (status?: string) => {
        if (!status) return 'N/A'
        if (status === 'active') return 'Active'
        if (status === 'hospitalized') return 'Hospitalized'
        if (status === 'deceased') return 'Deceased'
        if (status === 'completed') return 'Completed'

        return status
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }
    const formatRiskLevel = (riskLevel: RiskLevel): string => {
        if (riskLevel === 'mild') return 'Mild'
        if (riskLevel === 'moderate') return 'Moderate'
        if (riskLevel === 'severe') return 'Severe'
        if (riskLevel === 'high_risk') return 'High Risk'
        else return riskLevel
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
                    {formatRiskLevel(item.riskLevel) || 'N/A'}
                </span>
            ),
        },
        {
            header: 'Caregiver',
            key: 'caregiver',
            render: (item: Patients) => <span className={styles.caregiver}>{item.caregiver || 'Unassigned'}</span>,
        },
        {
            header: 'Account Status',
            key: 'clinicalStatus',
            render: (item: Patients) => (
                <span className={`${styles.status} ${getStatusClass(item.clinicalStatus)}`}>
                    {formatAccountStatusLabel(item.clinicalStatus)}
                </span>
            ),
        },
        {
            header: 'Action',
            key: '_id',
            render: (item: Patients) => (
                <button className={styles.actionBtn} onClick={() => navigate(`/doctor/patients/${item._id}`)}>
                    View
                </button>
            ),
        },
    ]

    return (
        <MainWrapper title="Patient Directory" subtitle="Monitoring all patients">
            <div className={styles.filterSection}>
                <div className={styles.searchWrapper}>
                    <SearchField value={search} onSearch={setSearch} placeholder="Search patients..." />
                </div>
                <div className={styles.filtersPanel}>
                    <div className={styles.filterGroup}>
                        <ul className={styles.filterList}>
                            {CLINICAL_STATUS_OPTIONS.map((option) => (
                                <li
                                    key={option.value}
                                    className={styles.filterItem}
                                    onClick={() => setClinicalStatus(option.value)}
                                    aria-current={clinicalStatus === option.value}
                                >
                                    {option.label}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className={styles.filterGroup}>
                        <ul className={styles.filterList}>
                            <li
                                className={styles.filterItem}
                                onClick={() =>
                                    setRiskLevel((current) => (current === 'high_risk' ? 'all' : 'high_risk'))
                                }
                                aria-current={riskLevel === 'high_risk'}
                            >
                                High Risk
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <DataTable data={patients} columns={columns} keyExtractor={(item) => item.patientId} isLoading={isLoading}>
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
    )
}
export default PatientList
