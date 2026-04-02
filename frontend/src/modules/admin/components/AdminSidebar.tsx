import { LayoutDashboard, Users, UserCheck, ShieldPlus, History as HistoryIcon, CalendarDays } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

import { getPendingCount } from '../api/admin.api'

import styles from './AdminSidebar.module.css'

const AdminSidebar = () => {
    const [pendingCount, setPendingCount] = useState<number>(0)

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const data = await getPendingCount()
                setPendingCount(data.count)
            } catch (error) {
                console.error('Failed to fetch pending count:', error)
            }
        }
        fetchCount()
    }, [])

    return (
        <aside className={styles.sidebar}>
            <div className={styles.header}>
                <h2 className={styles.title}>Admin Portal</h2>
                <p className={styles.subtitle}>Healthcare Coordination</p>
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
                    {pendingCount > 0 && <span className={styles.badge}>{pendingCount}</span>}
                </NavLink>

                <NavLink
                    to="/admin/caregivers/verification"
                    className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
                >
                    <UserCheck size={20} />
                    <span>Caregiver Verification</span>
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
