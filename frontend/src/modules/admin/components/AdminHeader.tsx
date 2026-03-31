import styles from './AdminHeader.module.css'

import { useAuth } from '@/shared/context/AuthContext'
import { useLogout } from '@/modules/auth/hooks/useLogout'
import { LogOutIcon } from 'lucide-react'
import { SettingsIcon } from 'lucide-react'

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
                    <LogOutIcon />
                    Logout
                </button>
                <SettingsIcon />
                <div className={styles.avatar}>👤</div>
            </div>
        </header>
    )
}
export default AdminHeader
