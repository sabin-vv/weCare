import { Outlet } from 'react-router-dom'

import AdminHeader from './AdminHeader'
import styles from './AdminLayout.module.css'
import AdminSidebar from './AdminSidebar'

import { PendingCountProvider } from '@/shared/context/PendingCountContext'

const AdminLayout = () => {
    return (
        <PendingCountProvider>
            <div className={styles.container}>
                <AdminSidebar />
                <div className={styles.main}>
                    <AdminHeader />
                    <div className={styles.content}>
                        <Outlet />
                    </div>
                </div>
            </div>
        </PendingCountProvider>
    )
}

export default AdminLayout
