import { Outlet } from 'react-router-dom'

import styles from './PublicLayout.module.css'

import { Role } from '@/modules/auth/types/auth.types'
import Footer from '@/shared/components/Footer/Footer'
import Header from '@/shared/components/Header/Header'
import type { NavLink } from '@/shared/components/Header/Header.types'
import { caregiverNavLinks, doctorNavLinks, patientNavLinks } from '@/shared/constants/navLinks'
import { useAuth } from '@/shared/context/AuthContext'

const PublicLayout = () => {
    const { user } = useAuth()
    let navLinks: NavLink[] = []

    if (user) {
        switch (user.role) {
            case Role.CAREGIVER:
                navLinks = caregiverNavLinks
                break
            case Role.PATIENT:
                navLinks = patientNavLinks
                break
            case Role.DOCTOR:
                navLinks = doctorNavLinks
                break
            default:
                navLinks = []
        }
    }

    return (
        <div className={styles.layout}>
            <Header navLinks={navLinks} />
            <main className={styles.content}>
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}
export default PublicLayout
