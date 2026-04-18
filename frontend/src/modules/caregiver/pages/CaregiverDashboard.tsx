import CaregiverDetailsForm from '../form/CaregiverDetailsForm'

import styles from './CaregiverDashboard.module.css'

import { VerificationStatus } from '@/modules/auth/types/auth.types'
import { useAuth } from '@/shared/context/AuthContext'

const CaregiverDashboard = () => {
    const { user } = useAuth()
    return (
        <main className={styles.content}>
            {!user?.isProfileComplete ? (
                <CaregiverDetailsForm />
            ) : user.verificationStatus === VerificationStatus.Verified ? (
                <section className={styles.statusPanel}>
                    <span className={`${styles.badge} ${styles.successBadge}`}>Verified Account</span>
                    <h1 className={styles.heading}>Welcome back, {user?.name}</h1>
                    <p className={styles.sub}>
                        Your account is active and ready. You can now manage patients, schedules, and caregiving duties
                        from your dashboard.
                    </p>
                </section>
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
        </main>
    )
}

export default CaregiverDashboard
