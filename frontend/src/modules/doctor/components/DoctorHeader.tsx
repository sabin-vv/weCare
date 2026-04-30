import Header from '../../../shared/components/Header/Header'
import type { NavLink } from '../../../shared/components/Header/Header.types'

import { useAuth } from '@/shared/context/AuthContext'

const doctorNavLinks: NavLink[] = [
    { label: 'Dashboard', path: '/doctor/dashboard' },
    { label: 'Patient List', path: '/doctor/patients' },
    { label: 'Schedule', path: '/doctor/availability' },
]

const DoctorHeader = () => {
    const { user } = useAuth()
    return <Header titlePrefix="Dr. " subtitle={user?.professionalTitle} navLinks={doctorNavLinks} />
}

export default DoctorHeader
