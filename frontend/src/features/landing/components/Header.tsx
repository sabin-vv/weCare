import React from 'react'
import { useNavigate } from 'react-router-dom'

import styles from './Header.module.css'

const Header: React.FC = () => {
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
                    <button className={styles.loginBtn} onClick={() => navigate('/api/auth/login')}>
                        Login
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
