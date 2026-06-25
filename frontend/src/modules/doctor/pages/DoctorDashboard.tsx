import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getCurrentUser } from '../../auth/api/auth.api'
import { getDoctorProfile } from '../api/doctor.api'
import Dashboard from '../components/Dashboard/Dashboard'
import DoctorDetailsForm from '../form/DoctorDetailesForm'
import type { DoctorDocuments, Specialization } from '../types/doctor.types'

import styles from './DoctorDashboard.module.css'

import { env } from '@/config/env'
import { VerificationStatus } from '@/modules/auth/types/auth.types'
import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import { useAuth } from '@/shared/context/AuthContext'
import { getErrorMessage } from '@/utils/getErrorMessage'

const DoctorDashboard = () => {
    const { user, setAuth } = useAuth()
    const [documents, setDocuments] = useState<DoctorDocuments>()
    const [specializations, setSpecializations] = useState<Specialization[]>([{ name: '', documentImage: null }])
    const [rejectReason, setRejectReason] = useState<string>()

    const baseUrl = env.AWS_BASE_URL
    useEffect(() => {
        if (!user) {
            return
        }

        const loadDashboardState = async () => {
            try {
                const currentUser = await getCurrentUser()
                const nextUser = {
                    ...user,
                    verificationStatus: currentUser.data.verificationStatus ?? user.verificationStatus,
                    profileImage: currentUser.data.profileImage ?? user.profileImage,
                    professionalTitle: currentUser.data.professionalTitle ?? user.professionalTitle,
                }

                const hasAuthChanged =
                    nextUser.verificationStatus !== user.verificationStatus ||
                    nextUser.profileImage !== user.profileImage ||
                    nextUser.professionalTitle !== user.professionalTitle

                if (hasAuthChanged) {
                    setAuth(nextUser)
                }

                if (nextUser.verificationStatus === VerificationStatus.REJECTED) {
                    const profile = await getDoctorProfile()

                    setDocuments({
                        govId: `${baseUrl}${profile.govIdImage}`,
                        profileImage: `${baseUrl}${profile.profileImage}`,
                        medicalCertificate: {
                            number: profile.medicalCertificateNumber,
                            document: `${baseUrl}${profile.medicalCertificateImage}`,
                        },
                        councilRegistration: {
                            number: profile.medicalCouncilRegistrationNumber,
                            document: `${baseUrl}${profile.medicalCouncilImage}`,
                        },
                    })
                    setSpecializations(
                        profile.specialization.map((spec) => ({
                            name: spec.name,
                            documentImage: `${baseUrl}${spec.documentImage}`,
                        })),
                    )
                    setRejectReason(profile.rejectReason || '')
                    return
                }

                setRejectReason(undefined)
            } catch (error) {
                toast.error(getErrorMessage(error))
            }
        }

        loadDashboardState()
    }, [baseUrl, setAuth, user])

    const hour = new Date().getHours()
    let timePeriod = ''
    if (hour >= 5 && hour < 12) timePeriod = 'Morning'
    else if (hour >= 12 && hour < 17) timePeriod = 'Afternoon'
    else if (hour >= 17 && hour < 21) timePeriod = 'Evening'
    else timePeriod = 'Night'

    return (
        <MainWrapper title={`Good ${timePeriod},${user?.name}`}>
            {!user?.isProfileComplete || user.verificationStatus === 'rejected' ? (
                <>
                    {user && user.verificationStatus === 'rejected' && (
                        <div className={styles.rejectBox}>
                            <strong>Profile Rejected</strong>
                            <p>{rejectReason}</p>
                        </div>
                    )}

                    <DoctorDetailsForm document={documents} specialization={specializations} />
                </>
            ) : user.verificationStatus === VerificationStatus.Verified ? (
                <Dashboard />
            ) : (
                <section className={styles.statusPanel}>
                    <span className={`${styles.badge} ${styles.pendingBadge}`}>Verification In Progress</span>
                    <h1 className={styles.heading}>Account under verification</h1>
                    <p className={styles.sub}>
                        We are reviewing your profile, medical council registration, and uploaded documents. Once
                        approved, your full doctor dashboard will be unlocked.
                    </p>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoCard}>
                            <h2>Current status</h2>
                            <p>Submitted successfully and waiting for admin approval.</p>
                        </div>
                        <div className={styles.infoCard}>
                            <h2>What to expect</h2>
                            <p>You will be able to access patients and appointments after verification is complete.</p>
                        </div>
                    </div>
                </section>
            )}
        </MainWrapper>
    )
}

export default DoctorDashboard
