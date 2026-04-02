import styles from './DoctorDashboard.module.css'

import { useLogout } from '@/modules/auth/hooks/useLogout'
import { useAuth } from '@/shared/context/AuthContext'

const DoctorDashboard = () => {
    const { user } = useAuth()
    const handleLogout = useLogout()

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.badge}>Doctor</div>
                <h1 className={styles.heading}>Welcome, Dr. {user?.name} 👨‍⚕️</h1>
                <p className={styles.sub}>{user?.email}</p>
                <button className={styles.btn} onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    )
}

export default DoctorDashboard
