import type { ReactNode } from 'react'

import styles from './PatientLayout.module.css'

import PatientHeader from '@/modules/patient/component/PatientHeader'
import PatientAssistantWidget from '@/modules/patient/component/PatientAssistantWidget'
import Footer from '@/shared/components/Footer/Footer'

const PatientLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className={styles.layout}>
            <PatientHeader />
            <PatientAssistantWidget />

            <main className={styles.content}>{children}</main>

            <Footer />
        </div>
    )
}

export default PatientLayout
