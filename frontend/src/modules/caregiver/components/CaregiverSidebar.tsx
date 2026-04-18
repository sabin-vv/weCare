import { BarChart3, Bell, LayoutDashboard, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import styles from './CaregiverSidebar.module.css'

const links = [
    {
        to: '/caregiver/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
    },
    {
        to: '/caregiver/patients',
        label: 'Patients',
        icon: Users,
    },
    {
        to: '/caregiver/reminders',
        label: 'Reminders',
        icon: Bell,
    },
    {
        to: '/caregiver/activity-log',
        label: 'Activity Log',
        icon: BarChart3,
    },
]

const CaregiverSidebar = () => {
    return (
        <aside className={styles.sidebar}>
            <nav className={styles.nav} aria-label="Caregiver navigation">
                {links.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
                    >
                        <Icon size={20} strokeWidth={2.25} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}

export default CaregiverSidebar
