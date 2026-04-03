import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getPendingCaregivers, getRecentCaregiverVerifications, verifyCaregiver } from '../api/admin.api'
import type { PendingCaregiver, RecentCaregiver } from '../interfaces/admin.interface'
import { pendingCaregiverColumns, recentCaregiverColumns } from '../columns/caregiverVerification.columns'

import styles from './DoctorVerification.module.css'

import DataTable from '@/shared/components/Table/DataTable'
import Modal from '@/shared/components/Modal/Modal'
import Pagination from '@/shared/components/Pagination/Pagination'
import SearchField from '@/shared/components/SearchField/SearchField'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { getFileUrl } from '@/utils/getFileUrl'

const CaregiverVerificationPage = () => {
    const [caregivers, setCaregivers] = useState<PendingCaregiver[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalCount: 0, totalPages: 1 })
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedCaregiver, setSelectedCaregiver] = useState<PendingCaregiver | null>(null)
    const [activeTab, setActiveTab] = useState<'certificate' | 'license' | 'govid'>('certificate')
    const [recentCaregivers, setRecentCaregivers] = useState<RecentCaregiver[]>([])
    const [recentLoading, setRecentLoading] = useState(true)

    const fetchCaregivers = async (page = 1, searchQuery = '') => {
        setLoading(true)
        try {
            const data = await getPendingCaregivers(page, 10, searchQuery)
            setCaregivers(data.caregivers)
            setPagination(data.pagination)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    const fetchRecentCaregivers = async () => {
        setRecentLoading(true)
        try {
            const data = await getRecentCaregiverVerifications(10)
            setRecentCaregivers(data.caregivers)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setRecentLoading(false)
        }
    }

    const handleAction = async (caregiverId: string, status: 'verified' | 'rejected') => {
        try {
            await verifyCaregiver(caregiverId, status)
            toast.success(`Caregiver ${status === 'verified' ? 'approved' : 'rejected'} successfully`)
            setIsModalOpen(false)
            fetchCaregivers(pagination.page)
            fetchRecentCaregivers()
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const openDocumentViewer = (caregiver: PendingCaregiver) => {
        setSelectedCaregiver(caregiver)
        setActiveTab('certificate')
        setIsModalOpen(true)
    }

    useEffect(() => {
        fetchCaregivers()
        fetchRecentCaregivers()
    }, [])

    const currentDocUrl = (() => {
        if (!selectedCaregiver) return ''
        if (activeTab === 'certificate') return selectedCaregiver.certificateImage
        if (activeTab === 'license') return selectedCaregiver.licenseImage
        return selectedCaregiver.govIdImage
    })()

    const columnsWithActions = [
        ...pendingCaregiverColumns,
        {
            header: 'Documents',
            key: 'documents' as keyof PendingCaregiver,
            render: (caregiver: PendingCaregiver) => (
                <button onClick={() => openDocumentViewer(caregiver)} className={styles.viewDocBtn}>
                    📄 View Documents
                </button>
            ),
        },
        {
            header: 'Actions',
            key: 'actions' as keyof PendingCaregiver,
            render: (caregiver: PendingCaregiver) => (
                <div className={styles.actions}>
                    <button className={styles.approveBtn} onClick={() => handleAction(caregiver._id, 'verified')}>
                        Approve
                    </button>
                    <button className={styles.rejectBtn} onClick={() => handleAction(caregiver._id, 'rejected')}>
                        Reject
                    </button>
                </div>
            ),
        },
    ]

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Pending Caregiver Registrations</h1>
                <p className={styles.subtitle}>
                    Review and verify professional credentials for newly registered caregiver accounts.
                </p>
            </div>

            <div className={styles.searchContainer}>
                <SearchField
                    placeholder="Search caregiver by name or email ..."
                    onSearch={(query) => fetchCaregivers(1, query)}
                />
            </div>

            {caregivers.length > 0 && (
                <DataTable
                    data={caregivers}
                    columns={columnsWithActions}
                    keyExtractor={(caregiver) => caregiver._id}
                    isLoading={loading}
                >
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalCount={pagination.totalCount}
                        limit={pagination.limit}
                        onPageChange={(page) => fetchCaregivers(page, '')}
                    />
                </DataTable>
            )}

            <div className={styles.recentSection}>
                <h2 className={styles.recentTitle}>Recent Verifications</h2>
                <DataTable
                    data={recentCaregivers}
                    columns={recentCaregiverColumns}
                    keyExtractor={(caregiver) => caregiver._id}
                    isLoading={recentLoading}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Verification: ${selectedCaregiver?.name || ''}`}
                footer={
                    <>
                        <button
                            className={styles.rejectBtn}
                            onClick={() => selectedCaregiver && handleAction(selectedCaregiver._id, 'rejected')}
                        >
                            Reject
                        </button>
                        <button
                            className={styles.approveBtn}
                            onClick={() => selectedCaregiver && handleAction(selectedCaregiver._id, 'verified')}
                        >
                            Approve
                        </button>
                    </>
                }
            >
                {selectedCaregiver && (
                    <div className={styles.modalContent}>
                        <div className={styles.docHead}>
                            <p>
                                <strong>Certificate No:</strong> #{selectedCaregiver.certificateNumber}
                            </p>
                            <p>
                                <strong>License No:</strong> #{selectedCaregiver.licenseNumber}
                            </p>
                        </div>

                        <div className={styles.tabBar}>
                            <button
                                className={`${styles.tab} ${activeTab === 'certificate' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('certificate')}
                            >
                                Certificate
                            </button>
                            <button
                                className={`${styles.tab} ${activeTab === 'license' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('license')}
                            >
                                License
                            </button>
                            <button
                                className={`${styles.tab} ${activeTab === 'govid' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('govid')}
                            >
                                Govt ID
                            </button>
                        </div>

                        <div className={styles.docWrapper}>
                            {currentDocUrl?.endsWith('.pdf') ? (
                                <iframe
                                    key={currentDocUrl}
                                    src={getFileUrl(currentDocUrl)}
                                    className={styles.docIframe}
                                    title="Caregiver Document Viewer"
                                />
                            ) : currentDocUrl ? (
                                <img
                                    key={currentDocUrl}
                                    src={getFileUrl(currentDocUrl)}
                                    className={styles.docImage}
                                    alt="Caregiver Document Preview"
                                />
                            ) : (
                                <div className={styles.noDoc}>No document uploaded</div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default CaregiverVerificationPage
