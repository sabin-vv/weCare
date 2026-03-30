import { Outlet } from 'react-router-dom'
import AdminHeader from './AdminHeader'
import AdminSidebar from './AdminSidebar'
import styles from './AdminLayout.module.css'

const AdminLayout = () => {
    return (
        <div className={styles.container}>
            <AdminSidebar />
            <div className={styles.main}>
                <AdminHeader />
                <div className={styles.content}>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default AdminLayout
