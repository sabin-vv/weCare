import { BellRing, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import styles from './Navbar.module.css'

import { env } from '@/config/env'
import LogoutButton from '@/shared/components/LogoutButton/LogoutButton'
import { useAuth } from '@/shared/context/AuthContext'
import { usePlatform } from '@/shared/context/PlatformContext'

const Navbar = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { settings } = usePlatform()
    const baseUrl = env.AWS_BASE_URL

    return (
        <header className={styles.navbar}>
            <div className={styles.left}>
                <img src={`${baseUrl}${settings?.platformLogo}`} alt="/logo" className={styles.logo} />
            </div>
            <nav className={styles.center}>
                <ul>
                    <li className={styles.link} onClick={() => navigate('/doctor/dashboard')}>
                        Dashboard
                    </li>
                    <li className={styles.link} onClick={() => navigate('/doctor/patients')}>
                        Patient List
                    </li>
                    <li className={styles.link} onClick={() => navigate('/doctor/availability')}>
                        Schedule
                    </li>
                </ul>
            </nav>
            <div className={styles.right}>
                <BellRing className={styles.icon} onClick={() => navigate('/doctor/notification')} />
                <Settings className={styles.icon} onClick={() => navigate('/doctor/settings')} />

                <LogoutButton />

                <div className={styles.profile}>
                    <div className={styles.profileText}>
                        <h4>Dr.{user?.name}</h4>
                        <p>{user?.professionalTitle}</p>
                    </div>
                    {user?.profileImage ? (
                        <img src={`${baseUrl}${user?.profileImage}`} alt="/profile" className={styles.profileImg} />
                    ) : (
                        <div className={styles.avatarFallback}>
                            <h1>{user?.name?.charAt(0)?.toUpperCase() || 'Dr'}</h1>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Navbar
