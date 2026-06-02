import { Outlet } from 'react-router-dom'

import styles from './CaregiverLayout.module.css'

import CaregiverHeader from '@/modules/caregiver/components/CaregiverHeader'
import Footer from '@/shared/components/Footer/Footer'

const CaregiverLayout = () => {
    return (
        <div className={styles.shell}>
            <CaregiverHeader />
            <div className={styles.body}>
                <main className={styles.main}>
                    <div className={styles.content}>
                        <Outlet />
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    )
}

export default CaregiverLayout
