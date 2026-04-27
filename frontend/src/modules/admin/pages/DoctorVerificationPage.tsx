/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getPendingDoctors, getRecentDoctorVerifications, verifyDoctor, verifySpecialization } from '../api/admin.api'
import type { PendingDoctor } from '../interfaces/admin.interface'

import styles from './DoctorVerification.module.css'

import Modal from '@/shared/components/Modal/Modal'
import PageHeader from '@/shared/components/PageHeader/PageHeader'
import Pagination from '@/shared/components/Pagination/Pagination'
import SearchField from '@/shared/components/SearchField/SearchField'
import DataTable from '@/shared/components/Table/DataTable'
import { usePendingCount } from '@/shared/context/PendingCountContext'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { getFileUrl } from '@/utils/getFileUrl'

const DoctorVerificationPage = () => {
    const [doctors, setDoctors] = useState<PendingDoctor[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalCount: 0, totalPages: 1 })
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDoctor, setSelectedDoctor] = useState<PendingDoctor | null>(null)
    const [activeTab, setActiveTab] = useState<string>('council')
    const [recentDoctors, setRecentDoctors] = useState<PendingDoctor[]>([])
    const [recentLoading, setRecentLoading] = useState(true)
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')
    const { refreshCounts } = usePendingCount()

    const fetchDoctors = async (page = 1, searchQuery = '') => {
        setLoading(true)
        try {
            const data = await getPendingDoctors(page, 10, searchQuery)
            setDoctors(data.doctors)
            setPagination(data.pagination)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    const fetchRecentDoctors = async () => {
        setRecentLoading(true)
        try {
            const data = await getRecentDoctorVerifications(10)
            setRecentDoctors(data.doctors)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setRecentLoading(false)
        }
    }

    const handleAction = async (doctorId: string, status: 'verified' | 'rejected', reason?: string) => {
        try {
            await verifyDoctor(doctorId, status, reason)
            toast.success(`Doctor ${status === 'verified' ? 'approved' : 'rejected'} successfully`)
            setIsModalOpen(false)
            setIsRejectionModalOpen(false)
            setRejectionReason('')
            fetchDoctors(pagination.page)
            fetchRecentDoctors()
            refreshCounts()
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const openRejectionModal = () => {
        setRejectionReason('Information provided is insufficient')
        setIsRejectionModalOpen(true)
    }

    const handleSpecVerify = async (index: number) => {
        if (!selectedDoctor) return
        try {
            await verifySpecialization(selectedDoctor._id, index, true)
            toast.success('Specialization verified successfully')

            const updatedDoctors = doctors.map((d) => {
                if (d._id === selectedDoctor._id) {
                    const newSpecs = [...d.specializations]
                    newSpecs[index] = { ...newSpecs[index], verified: true }
                    return { ...d, specializations: newSpecs }
                }
                return d
            })
            setDoctors(updatedDoctors)
            setSelectedDoctor((prev) => {
                if (!prev) return null
                const newSpecs = [...prev.specializations]
                newSpecs[index] = { ...newSpecs[index], verified: true }
                return { ...prev, specializations: newSpecs }
            })
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const openDocumentViewer = (doctor: PendingDoctor) => {
        setSelectedDoctor(doctor)
        setActiveTab('council')
        setIsModalOpen(true)
    }

    useEffect(() => {
        fetchDoctors()
        fetchRecentDoctors()
    }, [])

    const getDocUrl = () => {
        if (!selectedDoctor) return ''
        if (activeTab === 'council') return selectedDoctor.medicalCouncilImage
        if (activeTab === 'certificate') return selectedDoctor.medicalCertificateImage
        if (activeTab === 'govid') return selectedDoctor.govIdImage
        if (activeTab.startsWith('spec-')) {
            const index = parseInt(activeTab.split('-')[1])
            return selectedDoctor.specializations[index]?.documentImage
        }
        return ''
    }

    const currentDocUrl = getDocUrl()
    const currentSpecIndex = activeTab.startsWith('spec-') ? parseInt(activeTab.split('-')[1]) : -1
    const isCurrentSpecVerified = currentSpecIndex !== -1 && selectedDoctor?.specializations[currentSpecIndex]?.verified

    const pendingColumns = [
        {
            header: 'Doctor Name',
            key: 'name' as keyof PendingDoctor,
            render: (doctor: PendingDoctor) => (
                <div className={styles.doctorInfo}>
                    <div className={styles.avatar}>
                        {doctor.profileImage ? (
                            <img src={getFileUrl(doctor.profileImage)} alt={doctor.name} />
                        ) : (
                            doctor.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                        )}
                    </div>
                    <div className={styles.infoContent}>
                        <h4>Dr. {doctor.name}</h4>
                        <p>{doctor.email}</p>
                    </div>
                </div>
            ),
        },
        {
            header: 'License Number',
            key: 'medicalCouncilRegisterNumber' as keyof PendingDoctor,
            render: (doctor: PendingDoctor) => (
                <span className={styles.license}>#{doctor.medicalCouncilRegisterNumber}</span>
            ),
        },
        {
            header: 'Submission Date',
            key: 'createdAt' as keyof PendingDoctor,
            render: (doctor: PendingDoctor) => (
                <div className={styles.date}>
                    {new Date(doctor.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    })}
                    <span className={styles.time}>
                        {new Date(doctor.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                </div>
            ),
        },
        {
            header: 'Specialty',
            key: 'specializations' as keyof PendingDoctor,
            render: (doctor: PendingDoctor) => (
                <span className={styles.specialtyBadge}>{doctor.specializations?.[0]?.name || 'General'}</span>
            ),
        },
        {
            header: 'Documents',
            key: 'documents' as keyof PendingDoctor,
            render: (doctor: PendingDoctor) => (
                <button onClick={() => openDocumentViewer(doctor)} className={styles.viewDocBtn}>
                    📄 View Documents
                </button>
            ),
        },
        {
            header: 'Actions',
            key: 'actions' as keyof PendingDoctor,
            render: (doctor: PendingDoctor) => (
                <div className={styles.actions}>
                    <button className={styles.approveBtn} onClick={() => handleAction(doctor._id, 'verified')}>
                        Approve
                    </button>
                    <button
                        className={styles.rejectBtn}
                        onClick={() => {
                            setSelectedDoctor(doctor)
                            openRejectionModal()
                        }}
                    >
                        Reject
                    </button>
                </div>
            ),
        },
    ]

    const recentColumns = [
        {
            header: 'Doctor Name',
            key: 'name' as keyof PendingDoctor,
            render: (doctor: PendingDoctor) => (
                <div className={styles.doctorInfo}>
                    <div className={styles.avatar}>
                        {doctor.profileImage ? (
                            <img src={getFileUrl(doctor.profileImage)} alt={doctor.name} />
                        ) : (
                            doctor.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                        )}
                    </div>
                    <div className={styles.infoContent}>
                        <h4>Dr. {doctor.name}</h4>
                        <p>{doctor.email}</p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Status',
            key: 'verificationStatus' as keyof PendingDoctor,
            render: (doctor: PendingDoctor) => (
                <div className={styles.statusCell}>
                    <span
                        className={
                            doctor.verificationStatus === 'verified' ? styles.verifiedBadge : styles.rejectedBadge
                        }
                    >
                        {doctor.verificationStatus}
                    </span>
                    {doctor.verificationStatus === 'rejected' && doctor.rejectReason && (
                        <p className={styles.rejectReasonText} title={doctor.rejectReason}>
                            Reason: {doctor.rejectReason}
                        </p>
                    )}
                </div>
            ),
        },
        {
            header: 'Verified/Rejected On',
            key: 'updatedAt' as keyof PendingDoctor,
            render: (doctor: PendingDoctor) =>
                new Date(doctor.updatedAt || doctor.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                }),
        },
        {
            header: 'Documents',
            key: 'documents' as keyof PendingDoctor,
            render: (doctor: PendingDoctor) => (
                <button onClick={() => openDocumentViewer(doctor)} className={styles.viewDocBtn}>
                    📄 View
                </button>
            ),
        },
    ]

    return (
        <div className={styles.container}>
            <PageHeader
                title="Doctor Registrations"
                subtitle="Review and verify medical credentials or manage existing practitioners."
            />

            <div className={styles.searchContainer}>
                <SearchField
                    value={search}
                    placeholder="Search pending doctor by name or email ..."
                    onSearch={(query) => {
                        setSearch(query)
                        fetchDoctors(1, query)
                    }}
                />
            </div>

            {doctors.length > 0 && (
                <DataTable
                    data={doctors}
                    columns={pendingColumns}
                    keyExtractor={(doctor) => doctor._id}
                    isLoading={loading}
                >
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalCount={pagination.totalCount}
                        limit={pagination.limit}
                        onPageChange={(page) => fetchDoctors(page, search)}
                    />
                </DataTable>
            )}

            <div className={styles.recentSection}>
                <h2 className={styles.recentTitle}>Recent Verifications</h2>
                <DataTable
                    data={recentDoctors}
                    columns={recentColumns}
                    keyExtractor={(doctor) => doctor._id}
                    isLoading={recentLoading}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Verification: Dr. ${selectedDoctor?.name}`}
                footer={
                    selectedDoctor?.verificationStatus === 'pending' ? (
                        <>
                            <button className={styles.rejectBtn} onClick={openRejectionModal}>
                                Reject
                            </button>
                            <button
                                className={styles.approveBtn}
                                onClick={() => selectedDoctor && handleAction(selectedDoctor._id, 'verified')}
                            >
                                Approve
                            </button>
                        </>
                    ) : null
                }
            >
                {selectedDoctor && (
                    <div className={styles.modalContent}>
                        <div className={styles.docHead}>
                            <p>
                                <strong>Council Reg. No:</strong> #{selectedDoctor.medicalCouncilRegisterNumber}
                            </p>
                            <p>
                                <strong>Certificate No:</strong> #{selectedDoctor.medicalCertificateNumber}
                            </p>
                            <p>
                                <strong>Specialty:</strong>{' '}
                                {selectedDoctor.specializations?.length
                                    ? selectedDoctor.specializations.map((s) => s.name).join(', ')
                                    : 'General'}
                            </p>
                        </div>
                        <div className={styles.tabBar}>
                            <button
                                className={`${styles.tab} ${activeTab === 'council' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('council')}
                            >
                                Medical Council
                            </button>
                            <button
                                className={`${styles.tab} ${activeTab === 'certificate' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('certificate')}
                            >
                                Medical Certificate
                            </button>
                            <button
                                className={`${styles.tab} ${activeTab === 'govid' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('govid')}
                            >
                                Govt ID
                            </button>
                            {selectedDoctor.specializations.map((spec, i) => (
                                <button
                                    key={`spec-${i}`}
                                    className={`${styles.tab} ${activeTab === `spec-${i}` ? styles.activeTab : ''}`}
                                    onClick={() => setActiveTab(`spec-${i}`)}
                                >
                                    {spec.name} Cert {spec.verified && '✓'}
                                </button>
                            ))}
                        </div>

                        {currentSpecIndex !== -1 && (
                            <div className={styles.specActionBar}>
                                {isCurrentSpecVerified ? (
                                    <div className={styles.verifiedBadge}>
                                        <span>Verified</span>
                                    </div>
                                ) : (
                                    selectedDoctor?.verificationStatus === 'pending' && (
                                        <div className={styles.specActionBar}>
                                            <button
                                                className={styles.specVerifyBtn}
                                                onClick={() => handleSpecVerify(currentSpecIndex)}
                                            >
                                                Verify This Certificate
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        <div className={styles.docWrapper}>
                            {currentDocUrl?.endsWith('.pdf') ? (
                                <iframe
                                    key={currentDocUrl}
                                    src={getFileUrl(currentDocUrl)}
                                    className={styles.docIframe}
                                    title="Doctor Document Viewer"
                                />
                            ) : currentDocUrl ? (
                                <img
                                    key={currentDocUrl}
                                    src={getFileUrl(currentDocUrl)}
                                    className={styles.docImage}
                                    alt="Doctor Document Preview"
                                />
                            ) : (
                                <div className={styles.noDoc}>No document uploaded</div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isRejectionModalOpen}
                onClose={() => setIsRejectionModalOpen(false)}
                title="Reason for Rejection"
                footer={
                    <>
                        <button className={styles.cancelBtn} onClick={() => setIsRejectionModalOpen(false)}>
                            Cancel
                        </button>
                        <button
                            className={styles.rejectBtn}
                            onClick={() =>
                                selectedDoctor && handleAction(selectedDoctor._id, 'rejected', rejectionReason)
                            }
                        >
                            Confirm Reject
                        </button>
                    </>
                }
            >
                <div className={styles.rejectionBody}>
                    <p>Please provide a reason for rejecting Dr. {selectedDoctor?.name}'s application:</p>
                    <textarea
                        className={styles.rejectionTextarea}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g. Medical certificate is expired or invalid..."
                        rows={4}
                    />
                </div>
            </Modal>
        </div>
    )
}

export default DoctorVerificationPage
