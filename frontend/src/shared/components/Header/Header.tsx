import { BellRing, Settings } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '../Button/Button'

import styles from './Header.module.css'
import type { HeaderProps, NavLink, RoleRoute } from './Header.types'

import { env } from '@/config/env'
import LogoutButton from '@/shared/components/LogoutButton/LogoutButton'
import { useAuth } from '@/shared/context/AuthContext'
import { useNotificationCount } from '@/shared/context/NotificationCountContext'
import { usePlatform } from '@/shared/context/PlatformContext'

const Header = ({ titlePrefix = '', subtitle, navLinks = [], children, leading }: HeaderProps) => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { count: notificationCount } = useNotificationCount()
    const { settings } = usePlatform()
    const baseUrl = env.AWS_BASE_URL
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const isAuthenticated = !!user

    const publicLinks: NavLink[] = [
        { label: 'Home', path: '/' },
        { label: 'Book an Appointment', path: '/appointments' },
    ]

    const links = isAuthenticated ? navLinks : publicLinks

    const roleRoutes: RoleRoute = {
        doctor: {
            notification: '/doctor/notification',
            settings: '/doctor/settings',
        },
        caregiver: {
            notification: '/caregiver/notification',
            settings: '/caregiver/settings',
        },
        patient: {
            notification: '/notification',
            settings: '/settings',
        },
        admin: {
            notification: '/admin/notification',
            settings: '/admin/settings',
        },
    }

    const currentRoutes = user ? roleRoutes[user.role] : null

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLinkClick = (path: string) => {
        navigate(path)
        setIsMenuOpen(false)
    }

    return (
        <header className={styles.navbar}>
            <div className={styles.left}>
                {leading}
                <img
                    src={`${baseUrl}${settings?.platformLogo}`}
                    alt="logo"
                    className={styles.logo}
                    onClick={() => navigate('/')}
                />
            </div>

            <nav className={styles.center}>
                <ul>
                    {links.map((link) => (
                        <li key={link.path} className={styles.link} onClick={() => navigate(link.path)}>
                            {link.label}
                        </li>
                    ))}
                </ul>
                {children}
            </nav>

            <div className={styles.right}>
                {isAuthenticated ? (
                    <>
                        <button
                            type="button"
                            className={styles.iconButton}
                            onClick={() => {
                                navigate(currentRoutes?.notification || '/')
                            }}
                            aria-label="Open notifications"
                        >
                            <BellRing className={styles.icon} />
                            {notificationCount > 0 && <span className={styles.notificationBadge}>{notificationCount}</span>}
                        </button>
                        <Settings
                            className={styles.icon}
                            onClick={() => {
                                navigate(currentRoutes?.settings || '/')
                            }}
                        />

                        <LogoutButton />

                        <div className={styles.profile} ref={menuRef}>
                            <div className={styles.profileMain} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                <div className={styles.profileText}>
                                    <h4>
                                        {titlePrefix}
                                        {user?.name}
                                    </h4>
                                    {subtitle && <p>{subtitle}</p>}
                                </div>
                                {user?.profileImage ? (
                                    <img
                                        src={`${baseUrl}${user?.profileImage}`}
                                        alt="/profile"
                                        className={styles.profileImg}
                                    />
                                ) : (
                                    <div className={styles.avatarFallback}>
                                        <h1>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</h1>
                                    </div>
                                )}
                            </div>
                            {isMenuOpen && (
                                <div className={styles.mobileMenu}>
                                    {links.map((link) => (
                                        <button
                                            key={link.path}
                                            className={styles.menuItem}
                                            onClick={() => handleLinkClick(link.path)}
                                        >
                                            {link.label}
                                        </button>
                                    ))}
                                    <button
                                        className={styles.menuItem}
                                        onClick={() => handleLinkClick(currentRoutes?.settings || '/')}
                                    >
                                        Settings
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className={styles.authBtn}>
                        <Button onClick={() => navigate('/auth/login')}>Login</Button>
                    </div>
                )}
            </div>
        </header>
    )
}

export default Header
