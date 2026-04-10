import type { ReactNode } from 'react'

import styles from './DoctorLayout.module.css'

import Navbar from '@/modules/doctor/components/Navbar'
import Sidebar from '@/modules/doctor/components/Sidebar'
import Footer from '@/shared/components/Footer/Footer'

const DoctorLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className={styles.Wrapper}>
            <Navbar />
            <div className={styles.body}>
                <Sidebar />
                <main className={styles.main}>{children}</main>
            </div>
            <Footer />
        </div>
    )
}
export default DoctorLayout
