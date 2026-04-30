import type { ReactNode } from 'react'

import styles from './DoctorLayout.module.css'

import DoctorHeader from '@/modules/doctor/components/DoctorHeader'
import Sidebar from '@/modules/doctor/components/Sidebar'
import Footer from '@/shared/components/Footer/Footer'

const DoctorLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className={styles.Wrapper}>
            <DoctorHeader />
            <div className={styles.body}>
                <Sidebar />
                <main className={styles.main}>{children}</main>
            </div>
            <Footer />
        </div>
    )
}
export default DoctorLayout
