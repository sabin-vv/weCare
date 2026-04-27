import { BellRing, Settings } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import styles from './Header.module.css'

import { env } from '@/config/env'
import LogoutButton from '@/shared/components/LogoutButton/LogoutButton'
import { useAuth } from '@/shared/context/AuthContext'
import { usePlatform } from '@/shared/context/PlatformContext'

export interface NavLink {
    label: string
    path: string
}

interface HeaderProps {
    titlePrefix?: string
    subtitle?: string
    navLinks?: NavLink[]
    children?: ReactNode
}

const Header = ({ titlePrefix = '', subtitle, navLinks = [], children }: HeaderProps) => {
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
                    {navLinks.map((link) => (
                        <li key={link.path} className={styles.link} onClick={() => navigate(link.path)}>
                            {link.label}
                        </li>
                    ))}
                </ul>
                {children}
            </nav>
            <div className={styles.right}>
                <BellRing
                    className={styles.icon}
                    onClick={() => {
                        if (navLinks.length > 0) {
                            navigate(navLinks[0]?.path.replace('/dashboard', '/notification') || '/')
                        } else if (user?.role) {
                            navigate(`/${user.role}/notification`)
                        } else {
                            navigate('/')
                        }
                    }}
                />
                <Settings
                    className={styles.icon}
                    onClick={() => {
                        if (navLinks.length > 0) {
                            navigate(navLinks[0]?.path.replace('/dashboard', '/settings'))
                        } else if (user?.role) {
                            navigate(`/${user.role}/settings`)
                        } else {
                            navigate('/')
                        }
                    }}
                />

                <LogoutButton />

                <div className={styles.profile}>
                    <div className={styles.profileText}>
                        <h4>
                            {titlePrefix}
                            {user?.name}
                        </h4>
                        {subtitle && <p>{subtitle}</p>}
                    </div>
                    {user?.profileImage ? (
                        <img src={`${baseUrl}${user?.profileImage}`} alt="/profile" className={styles.profileImg} />
                    ) : (
                        <div className={styles.avatarFallback}>
                            <h1>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</h1>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header
