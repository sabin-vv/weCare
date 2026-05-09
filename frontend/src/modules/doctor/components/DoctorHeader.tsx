import { Menu } from 'lucide-react'

import Header from '../../../shared/components/Header/Header'
import type { NavLink } from '../../../shared/components/Header/Header.types'

import styles from './DoctorHeader.module.css'

import { useAuth } from '@/shared/context/AuthContext'

const doctorNavLinks: NavLink[] = [
    { label: 'Dashboard', path: '/doctor/dashboard' },
    { label: 'Patient List', path: '/doctor/patients' },
    { label: 'Schedule', path: '/doctor/availability' },
]

interface DoctorHeaderProps {
    onMenuClick?: () => void
}

const DoctorHeader = ({ onMenuClick }: DoctorHeaderProps) => {
    const { user } = useAuth()

    const hamburgerButton = onMenuClick ? (
        <button onClick={onMenuClick} className={styles.sidebarToggleBtn} aria-label="Toggle sidebar">
            <Menu size={24} />
        </button>
    ) : null

    return (
        <Header
            titlePrefix="Dr. "
            subtitle={user?.professionalTitle}
            navLinks={doctorNavLinks}
            leading={hamburgerButton}
        />
    )
}

export default DoctorHeader
