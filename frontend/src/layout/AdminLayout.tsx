import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import AdminHeader from '../modules/admin/components/AdminHeader'
import AdminSidebar from '../modules/admin/components/AdminSidebar'

import styles from './AdminLayout.module.css'

import { PendingCountProvider } from '@/shared/context/PendingCountContext'

const AdminLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false)

    return (
        <PendingCountProvider>
            <div className={styles.container}>
                <AdminSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className={styles.main}>
                    <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
                    <div className={styles.content}>
                        <Outlet />
                    </div>
                </div>
                {isSidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}
            </div>
        </PendingCountProvider>
    )
}

export default AdminLayout
