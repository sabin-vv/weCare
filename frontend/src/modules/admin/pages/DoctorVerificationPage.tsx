import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import type { PendingDoctor } from '../interfaces/admin.interface'
import { adminService } from '../api/admin.api'
import { getFileUrl } from '@/utils/getFileUrl'

import styles from './DoctorVerification.module.css'

import Modal from '@/shared/components/Modal/Modal'
import { getErrorMessage } from '@/utils/getErrorMessage'

const DoctorVerificationPage = () => {
    const [doctors, setDoctors] = useState<PendingDoctor[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalCount: 0, totalPages: 1 })
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDoctor, setSelectedDoctor] = useState<PendingDoctor | null>(null)
    const [activeTab, setActiveTab] = useState<string>('council')

    const fetchDoctors = async (page = 1, searchQuery = '') => {
        setLoading(true)
        try {
            const data = await adminService.getPendingDoctors(page, 10, searchQuery)
            setDoctors(data.doctors)
            setPagination(data.pagination)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (doctorId: string, status: 'verified' | 'rejected') => {
        try {
            await adminService.verifyDoctor(doctorId, status)
            toast.success(`Doctor ${status === 'verified' ? 'approved' : 'rejected'} successfully`)
            setIsModalOpen(false)
            fetchDoctors(pagination.page, search)
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const handleSpecVerify = async (index: number) => {
        if (!selectedDoctor) return
        try {
            await adminService.verifySpecialization(selectedDoctor._id, index, true)
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
        const timer = setTimeout(() => fetchDoctors(1, search), 500)
        return () => clearTimeout(timer)
    }, [search])

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

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Pending Doctor Registrations</h1>
                <p className={styles.subtitle}>
                    Review and verify medical credentials for newly registered practitioner accounts.
                </p>
            </div>

            <div className={styles.controls}>
                <input
                    type="text"
                    placeholder="Search doctor by name or email ..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={styles.search}
                />
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Doctor Name</th>
                            <th>License Number</th>
                            <th>Submission Date</th>
                            <th>Specialty</th>
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
                        ) : doctors.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                                    No pending registrations found
                                </td>
                            </tr>
                        ) : (
                            doctors.map((doctor) => (
                                <tr key={doctor._id}>
                                    <td>
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
                                    </td>
                                    <td>
                                        <span className={styles.license}>#{doctor.medicalCouncilRegisterNumber}</span>
                                    </td>
                                    <td>
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
                                    </td>
                                    <td>
                                        <span className={styles.specialtyBadge}>
                                            {doctor.specializations?.[0]?.name || 'General'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => openDocumentViewer(doctor)}
                                            className={styles.viewDocBtn}
                                        >
                                            📄 View Documents
                                        </button>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.approveBtn}
                                                onClick={() => handleAction(doctor._id, 'verified')}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className={styles.rejectBtn}
                                                onClick={() => handleAction(doctor._id, 'rejected')}
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
                        Showing {doctors.length} of {pagination.totalCount} pending registrations
                    </div>
                    <div className={styles.pagination}>
                        <button
                            disabled={pagination.page === 1}
                            onClick={() => fetchDoctors(pagination.page - 1, search)}
                            className={styles.pageBtn}
                        >
                            {' '}
                            &lt;{' '}
                        </button>
                        {Array.from({ length: pagination.totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                className={`${styles.pageBtn} ${pagination.page === i + 1 ? styles.activePage : ''}`}
                                onClick={() => fetchDoctors(i + 1, search)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            disabled={pagination.page === pagination.totalPages}
                            onClick={() => fetchDoctors(pagination.page + 1, search)}
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
                title={`Verification: Dr. ${selectedDoctor?.name}`}
                footer={
                    <>
                        <button
                            className={styles.rejectBtn}
                            onClick={() => selectedDoctor && handleAction(selectedDoctor._id, 'rejected')}
                        >
                            Reject
                        </button>
                        <button
                            className={styles.approveBtn}
                            onClick={() => selectedDoctor && handleAction(selectedDoctor._id, 'verified')}
                        >
                            Approve
                        </button>
                    </>
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
                                    <button
                                        className={styles.specVerifyBtn}
                                        onClick={() => handleSpecVerify(currentSpecIndex)}
                                    >
                                        Verify This Certificate
                                    </button>
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
        </div>
    )
}

export default DoctorVerificationPage
