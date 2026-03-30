import StatCard from '../components/StatCard'

import styles from './AdminDashboard.module.css'

const AdminDashboard = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>Admin Dashboard</h1>

            <div className={styles.statsGrid}>
                <StatCard title="Total Doctors" value={0} />
                <StatCard title="Total Caregivers" value={0} />
                <StatCard title="Pending Verifications" value={0} />
                <StatCard title="Total Patients" value={0} />
            </div>

            <div className={styles.overview}>
                <div className={styles.section}>
                    <h3>Recent Registrations</h3>
                    <div className={styles.placeholder}>Registration data will appear here...</div>
                </div>
                <div className={styles.section}>
                    <h3>System Alerts</h3>
                    <div className={styles.placeholder}>No new system alerts.</div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
