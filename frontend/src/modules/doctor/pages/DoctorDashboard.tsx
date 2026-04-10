import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import DoctorDetailsForm from '../form/DoctorDetailesForm'

import styles from './DoctorDashboard.module.css'

import { useAuth } from '@/shared/context/AuthContext'

const DoctorDashboard = () => {
    const { user } = useAuth()
    return (
        <div className={styles.page}>
            <Navbar />
            <div className={styles.body}>
                <Sidebar />
                <main className={styles.content}>
                {!user?.isProfileComplete ? (
                    <DoctorDetailsForm />
                ) : user.verificationStatus ? (
                    <section className={styles.statusPanel}>
                        <span className={`${styles.badge} ${styles.successBadge}`}>Verified Account</span>
                        <h1 className={styles.heading}>Welcome back, Dr. {user?.name}</h1>
                        <p className={styles.sub}>
                            Your account is active and ready. You can now manage patients, schedules, and consultations
                            from your dashboard.
                        </p>
                    </section>
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
                </main>
            </div>
        </div>
    )
}

export default DoctorDashboard
