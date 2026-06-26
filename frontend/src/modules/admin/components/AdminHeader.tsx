import { LogOutIcon, SettingsIcon, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import styles from './AdminHeader.module.css'

import { useLogout } from '@/modules/auth/hooks/useLogout'
import { useAuth } from '@/shared/context/AuthContext'

interface AdminHeaderProps {
    onMenuClick?: () => void
}

const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
    const { user } = useAuth()
    const handleLogout = useLogout()
    const navigate = useNavigate()

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                {onMenuClick && (
                    <button onClick={onMenuClick} className={styles.sidebarToggleBtn} aria-label="Toggle sidebar">
                        <Menu size={24} />
                    </button>
                )}
                <div className={styles.welcome}>
                    Welcome, <span>{user?.name || 'Admin'}</span>
                </div>
            </div>
            <div className={styles.profileArea}>
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
