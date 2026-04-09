import { BellRing, Settings } from 'lucide-react'

import styles from './Navbar.module.css'

import LogoutButton from '@/shared/components/LogoutButton/LogoutButton'
import { useAuth } from '@/shared/context/AuthContext'

const Navbar = () => {
    const { user } = useAuth()
    return (
        <header className={styles.navbar}>
            <div className={styles.left}>
                <img src="/logo.png" alt="/logo" className={styles.logo} />
            </div>
            <nav className={styles.center}>
                <ul>
                    <li className={styles.link}>Dashboard</li>
                    <li className={styles.link}>Patient List</li>
                    <li className={styles.link}>Schedule</li>
                </ul>
            </nav>
            <div className={styles.right}>
                <BellRing className={styles.icon} />
                <Settings className={styles.icon} />

                <LogoutButton />

                <div className={styles.profile}>
                    <div className={styles.profileText}>
                        <h4>Dr.{user?.name}</h4>
                        <p>{user?.specialization}</p>
                    </div>
                    {user?.profileImage ? (
                        <img src={user?.profileImage} alt="/profile" className={styles.profileImg} />
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
