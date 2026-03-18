import { useNavigate } from 'react-router-dom'

import styles from './Header.module.css'

import Button from '@/shared/components/Button/Button'

const Header = () => {
    const navigate = useNavigate()

    return (
        <header className={styles.header}>
            <div className={styles.headerContainer}>
                <div className={styles.logo} onClick={() => navigate('/')}>
                    WeCare
                </div>

                <nav className={styles.navLinks}>
                    <button className={styles.navLink} onClick={() => navigate('/')}>
                        Home
                    </button>
                    <button className={styles.navLink}>About Us</button>
                    <button className={styles.navLink}>Services</button>
                </nav>

                <div className={styles.actionButtons}>
                    <Button onClick={() => navigate('/api/auth/login')}>Login</Button>
                </div>
            </div>
        </header>
    )
}

export default Header
