import { useState } from 'react'
import type { ReactNode } from 'react'

import styles from './DoctorLayout.module.css'

import DoctorHeader from '@/modules/doctor/components/DoctorHeader'
import Sidebar from '@/modules/doctor/components/Sidebar'
import Footer from '@/shared/components/Footer/Footer'

const DoctorLayout = ({ children }: { children: ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

    const closeSidebar = () => setIsSidebarOpen(false)

    return (
        <div className={styles.Wrapper}>
            <DoctorHeader onMenuClick={toggleSidebar} />
            <div className={styles.body}>
                <div className={`${styles.sidebarWrapper} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
                    <Sidebar />
                </div>
                <div
                    className={`${styles.backdrop} ${isSidebarOpen ? styles.backdropVisible : ''}`}
                    onClick={closeSidebar}
                />
                <main className={styles.main}>{children}</main>
            </div>
            <Footer />
        </div>
    )
}
export default DoctorLayout
