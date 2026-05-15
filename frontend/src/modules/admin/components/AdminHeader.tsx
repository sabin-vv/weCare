import { BellRing, LogOutIcon, SettingsIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import styles from './AdminHeader.module.css'

import { useLogout } from '@/modules/auth/hooks/useLogout'
import { useAuth } from '@/shared/context/AuthContext'
import { usePendingCount } from '@/shared/context/PendingCountContext'

const AdminHeader = () => {
    const { user } = useAuth()
    const handleLogout = useLogout()
    const navigate = useNavigate()
    const { doctorCount, caregiverCount } = usePendingCount()
    const notificationCount = doctorCount + caregiverCount

    return (
        <header className={styles.header}>
            <div className={styles.welcome}>
                Welcome, <span>{user?.name || 'Admin'}</span>
            </div>
            <div className={styles.profileArea}>
                <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => navigate('/admin/notification')}
                    aria-label="Open notifications"
                >
                    <BellRing size={24} className={styles.icon} />
                    {notificationCount > 0 && <span className={styles.notificationBadge}>{notificationCount}</span>}
                </button>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    <LogOutIcon />
                    Logout
                </button>
                <button className={styles.settingsIcon}>
                    <SettingsIcon size={24} onClick={() => navigate('/admin/settings')} />
                </button>
                <div className={styles.avatar}>👤</div>
            </div>
        </header>
    )
}
export default AdminHeader
