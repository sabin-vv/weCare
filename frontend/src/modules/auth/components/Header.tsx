import { House, Stethoscope, LayoutDashboard, Calendar, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useLogout } from '../hooks/useLogout'
import { Role } from '../types/auth.types'

import styles from './Header.module.css'

import Button from '@/shared/components/Button/Button'
import { useAuth } from '@/shared/context/AuthContext'
import { usePlatform } from '@/shared/context/PlatformContext'

const Header = () => {
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()
    const { settings } = usePlatform()
    const handleLogout = useLogout()

    const initials =
        user?.name
            ?.split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'U'

    const logoUrl = settings?.platformLogo ? `${import.meta.env.VITE_S3_BASE_URL}${settings.platformLogo}` : ''

    return (
        <header className={styles.header}>
            <div className={styles.headerContainer}>
                <div className={styles.logo} onClick={() => navigate('/')}>
                    <img src={logoUrl} alt="logo" />
                </div>

                <nav className={styles.navLinks}>
                    <button className={styles.navLink} onClick={() => navigate('/')}>
                        <House /> Home
                    </button>
                    {isAuthenticated && (
                        <button className={styles.navLink} onClick={() => navigate('/dashboard')}>
                            <LayoutDashboard /> Dashboard
                        </button>
                    )}
                    <button className={styles.navLink} onClick={() => navigate('/doctors')}>
                        <Stethoscope />
                        Book an Appointment
                    </button>
                    {isAuthenticated && (
                        <button className={styles.navLink} onClick={() => navigate('/appointments')}>
                            <Calendar /> My Appointments
                        </button>
                    )}
                </nav>

                <div className={styles.actionButtons}>
                    {isAuthenticated ? (
                        <>
                            {user?.role === Role.PATIENT && (
                                <button
                                    className={styles.settingsBtn}
                                    onClick={() => navigate('/settings')}
                                    title="Settings"
                                >
                                    <Settings size={20} />
                                </button>
                            )}
                            <button className={styles.logoutBtn} onClick={handleLogout}>
                                Logout
                            </button>
                            <div className={styles.profileInfo}>
                                <div className={styles.avatar}>{initials}</div>
                            </div>
                        </>
                    ) : (
                        <Button onClick={() => navigate('/auth/login')}>Login</Button>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header
