import { House } from 'lucide-react'
import { Stethoscope } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useLogout } from '../hooks/useLogout'

import styles from './Header.module.css'

import Button from '@/shared/components/Button/Button'
import { useAuth } from '@/shared/context/AuthContext'

const Header = () => {
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()
    const handleLogout = useLogout()

    const initials =
        user?.name
            ?.split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'U'

    return (
        <header className={styles.header}>
            <div className={styles.headerContainer}>
                <div className={styles.logo} onClick={() => navigate('/')}>
                    <img src="" alt="logo" />
                </div>

                <nav className={styles.navLinks}>
                    <button className={styles.navLink} onClick={() => navigate('/')}>
                        <House /> Home
                    </button>
                    <button className={styles.navLink} onClick={() => navigate('/appointments')}>
                        <Stethoscope />
                        Book an Appointment
                    </button>
                </nav>

                <div className={styles.actionButtons}>
                    {isAuthenticated ? (
                        <>
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
