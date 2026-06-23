import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getCurrentUser } from '../../auth/api/auth.api'
import { getCaregiverProfile } from '../api/caregiver.api'
import Dashboard from '../components/Dashboard/Dashboard'
import CaregiverDetailsForm from '../form/CaregiverDetailsForm'
import type { CaregiverDocumentsDisplay } from '../types/caregiver.types'

import styles from './CaregiverDashboard.module.css'

import { env } from '@/config/env'
import { VerificationStatus } from '@/modules/auth/types/auth.types'
import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import { useAuth } from '@/shared/context/AuthContext'
import { getErrorMessage } from '@/utils/getErrorMessage'

const CaregiverDashboard = () => {
    const { user, setAuth } = useAuth()
    const [documents, setDocuments] = useState<CaregiverDocumentsDisplay>({
        govId: null,
        profileImage: null,
        certificate: {
            number: '',
            document: null,
        },
        license: {
            number: '',
            document: null,
        },
    })
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
                }

                const hasAuthChanged =
                    nextUser.verificationStatus !== user.verificationStatus ||
                    nextUser.profileImage !== user.profileImage

                if (hasAuthChanged) {
                    setAuth(nextUser)
                }

                if (nextUser.verificationStatus === VerificationStatus.REJECTED) {
                    const profile = await getCaregiverProfile()

                    setDocuments({
                        govId: `${baseUrl}${profile.data.govIdImage}`,
                        profileImage: `${baseUrl}${profile.data.profileImage}`,
                        certificate: {
                            number: profile.data.certificateNumber,
                            document: `${baseUrl}${profile.data.certificateImage}`,
                        },
                        license: {
                            number: profile.data.licenseNumber,
                            document: `${baseUrl}${profile.data.licenseImage}`,
                        },
                    })
                    setRejectReason(profile.data.rejectReason || '')
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
        <MainWrapper title={`Good ${timePeriod}, ${user?.name}`}>
            {!user?.isProfileComplete || user.verificationStatus === 'rejected' ? (
                <>
                    {user && user.verificationStatus === 'rejected' && (
                        <div className={styles.rejectBox}>
                            <strong>Profile Rejected</strong>
                            <p>{rejectReason}</p>
                        </div>
                    )}

                    <CaregiverDetailsForm documents={documents} />
                </>
            ) : user.verificationStatus === VerificationStatus.Verified ? (
                <Dashboard />
            ) : (
                <section className={styles.statusPanel}>
                    <span className={`${styles.badge} ${styles.pendingBadge}`}>Verification In Progress</span>
                    <h1 className={styles.heading}>Account under verification</h1>
                    <p className={styles.sub}>
                        We are reviewing your profile, certificates, and uploaded documents. Once approved, your full
                        caregiver dashboard will be unlocked.
                    </p>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoCard}>
                            <h2>Current status</h2>
                            <p>Submitted successfully and waiting for admin approval.</p>
                        </div>
                        <div className={styles.infoCard}>
                            <h2>What to expect</h2>
                            <p>
                                You will be able to access patients and caregiving tasks after verification is complete.
                            </p>
                        </div>
                    </div>
                </section>
            )}
        </MainWrapper>
    )
}

export default CaregiverDashboard
