import { LayoutDashboard, Users, UserCheck, ShieldPlus, History as HistoryIcon, CalendarDays } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { usePendingCount } from '@/shared/context/PendingCountContext'

import styles from './AdminSidebar.module.css'

const AdminSidebar = () => {
    const { doctorCount, caregiverCount } = usePendingCount()

    return (
        <aside className={styles.sidebar}>
            <div className={styles.header}>
                <div className={styles.logoWrapper}>
                    <img src="/logo" alt="logo" />
                </div>
                <div className={styles.headerText}>
                    <h2 className={styles.title}>Admin Portal</h2>
                    <p className={styles.subtitle}>WeCare health</p>
                </div>
            </div>

            <nav className={styles.nav}>
                <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
                >
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/admin/doctors/verification"
                    className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
                >
                    <div className={styles.linkGroup}>
                        <ShieldPlus size={20} />
                        <span>Doctor Verification</span>
                    </div>
                    {doctorCount > 0 && <span className={styles.badge}>{doctorCount}</span>}
                </NavLink>

                <NavLink
                    to="/admin/caregivers/verification"
                    className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
                >
                    <UserCheck size={20} />
                    <span>Caregiver Verification</span>
                    {caregiverCount > 0 && <span className={styles.badge}>{caregiverCount}</span>}
                </NavLink>

                <NavLink to="/admin/users" className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
                    <Users size={20} />
                    <span>User Management</span>
                </NavLink>

                <NavLink
                    to="/admin/activity-logs"
                    className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
                >
                    <HistoryIcon size={20} />
                    <span>Activity Logs</span>
                </NavLink>

                <NavLink
                    to="/admin/appointments"
                    className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
                >
                    <CalendarDays size={20} />
                    <span>Appointments</span>
                </NavLink>
            </nav>
        </aside>
    )
}

export default AdminSidebar
