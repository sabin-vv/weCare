import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getPendingCaregivers, verifyCaregiver } from '../api/admin.api'
import type { PendingCaregiver } from '../interfaces/admin.interface'

import styles from './DoctorVerification.module.css'

import Modal from '@/shared/components/Modal/Modal'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { getFileUrl } from '@/utils/getFileUrl'

const CaregiverVerificationPage = () => {
    const [caregivers, setCaregivers] = useState<PendingCaregiver[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalCount: 0, totalPages: 1 })
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedCaregiver, setSelectedCaregiver] = useState<PendingCaregiver | null>(null)
    const [activeTab, setActiveTab] = useState<'certificate' | 'license' | 'govid'>('certificate')

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

    const handleAction = async (caregiverId: string, status: 'verified' | 'rejected') => {
        try {
            await verifyCaregiver(caregiverId, status)
            toast.success(`Caregiver ${status === 'verified' ? 'approved' : 'rejected'} successfully`)
            setIsModalOpen(false)
            fetchCaregivers(pagination.page, search)
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
        const timer = setTimeout(() => fetchCaregivers(1, search), 500)
        return () => clearTimeout(timer)
    }, [search])

    const currentDocUrl = (() => {
        if (!selectedCaregiver) return ''
        if (activeTab === 'certificate') return selectedCaregiver.certificateImage
        if (activeTab === 'license') return selectedCaregiver.licenseImage
        return selectedCaregiver.govIdImage
    })()

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Pending Caregiver Registrations</h1>
                <p className={styles.subtitle}>
                    Review and verify professional credentials for newly registered caregiver accounts.
                </p>
            </div>

            <div className={styles.controls}>
                <input
                    type="text"
                    placeholder="Search caregiver by name or email ..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={styles.search}
                />
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Caregiver Name</th>
                            <th>Certificate No</th>
                            <th>License No</th>
                            <th>Submission Date</th>
                            <th>Documents</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                                    Loading...
                                </td>
                            </tr>
                        ) : caregivers.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                                    No pending registrations found
                                </td>
                            </tr>
                        ) : (
                            caregivers.map((caregiver) => (
                                <tr key={caregiver._id}>
                                    <td>
                                        <div className={styles.doctorInfo}>
                                            <div className={styles.avatar}>
                                                {caregiver.profileImage ? (
                                                    <img
                                                        src={getFileUrl(caregiver.profileImage)}
                                                        alt={caregiver.name}
                                                    />
                                                ) : (
                                                    caregiver.name
                                                        .split(' ')
                                                        .map((n) => n[0])
                                                        .join('')
                                                )}
                                            </div>
                                            <div className={styles.infoContent}>
                                                <h4>{caregiver.name}</h4>
                                                <p>{caregiver.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.license}>#{caregiver.certificateNumber}</span>
                                    </td>
                                    <td>
                                        <span className={styles.license}>#{caregiver.licenseNumber}</span>
                                    </td>
                                    <td>
                                        <div className={styles.date}>
                                            {new Date(caregiver.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                            <span className={styles.time}>
                                                {new Date(caregiver.createdAt).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => openDocumentViewer(caregiver)}
                                            className={styles.viewDocBtn}
                                        >
                                            📄 View Documents
                                        </button>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.approveBtn}
                                                onClick={() => handleAction(caregiver._id, 'verified')}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className={styles.rejectBtn}
                                                onClick={() => handleAction(caregiver._id, 'rejected')}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <div className={styles.footer}>
                    <div className={styles.summary}>
                        Showing {caregivers.length} of {pagination.totalCount} pending registrations
                    </div>
                    <div className={styles.pagination}>
                        <button
                            disabled={pagination.page === 1}
                            onClick={() => fetchCaregivers(pagination.page - 1, search)}
                            className={styles.pageBtn}
                        >
                            {' '}
                            &lt;{' '}
                        </button>
                        {Array.from({ length: pagination.totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                className={`${styles.pageBtn} ${pagination.page === i + 1 ? styles.activePage : ''}`}
                                onClick={() => fetchCaregivers(i + 1, search)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            disabled={pagination.page === pagination.totalPages}
                            onClick={() => fetchCaregivers(pagination.page + 1, search)}
                            className={styles.pageBtn}
                        >
                            {' '}
                            &gt;{' '}
                        </button>
                    </div>
                </div>
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
