import { Outlet } from 'react-router-dom'

import AdminHeader from '../modules/admin/components/AdminHeader'
import AdminSidebar from '../modules/admin/components/AdminSidebar'

import styles from './AdminLayout.module.css'

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
