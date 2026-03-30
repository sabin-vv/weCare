import styles from './AdminHeader.module.css'

import { useAuth } from '@/shared/context/AuthContext'
import { useLogout } from '@/shared/hooks/useLogout'
import LogoutIcon from '@/shared/icons/LogoutIcon'
import SettingsIcon from '@/shared/icons/SettingsIcon'

const AdminHeader = () => {
    const { user } = useAuth()
    const handleLogout = useLogout()

    return (
        <header className={styles.header}>
            <div className={styles.welcome}>
                Welcome, <span>{user?.name || 'Admin'}</span>
            </div>
            <div className={styles.profileArea}>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    <LogoutIcon />
                    Logout
                </button>
                <SettingsIcon />
                <div className={styles.avatar}>👤</div>
            </div>
        </header>
    )
}
export default AdminHeader
