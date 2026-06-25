import { Outlet } from 'react-router-dom'

import styles from './DoctorLayout.module.css'

import DoctorHeader from '@/modules/doctor/components/DoctorHeader'
import Footer from '@/shared/components/Footer/Footer'

const DoctorLayout = () => {
    return (
        <div className={styles.Wrapper}>
            <DoctorHeader />
            <div className={styles.body}>
                <main className={styles.main}>
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    )
}

export default DoctorLayout
