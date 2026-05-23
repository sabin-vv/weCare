import type { ReactNode } from 'react'

import styles from './DoctorLayout.module.css'

import DoctorHeader from '@/modules/doctor/components/DoctorHeader'
import Footer from '@/shared/components/Footer/Footer'

const DoctorLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className={styles.Wrapper}>
            <DoctorHeader />
            <div className={styles.body}>
                <main className={styles.main}>{children}</main>
            </div>
            <Footer />
        </div>
    )
}
export default DoctorLayout
