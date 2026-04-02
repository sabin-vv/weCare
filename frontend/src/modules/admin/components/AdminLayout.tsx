import { Outlet } from 'react-router-dom'

import AdminHeader from './AdminHeader'
import styles from './AdminLayout.module.css'
import AdminSidebar from './AdminSidebar'

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
