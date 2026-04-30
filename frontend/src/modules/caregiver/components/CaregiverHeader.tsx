import Header from '../../../shared/components/Header/Header'
import type { NavLink } from '../../../shared/components/Header/Header.types'

const caregiverNavLinks: NavLink[] = [
    { label: 'Dashboard', path: '/caregiver/dashboard' },
    { label: 'Patients', path: '/caregiver/patients' },
    { label: 'Reminders', path: '/caregiver/reminders' },
    { label: 'Activity Log', path: '/caregiver/activity-log' },
]

const CaregiverHeader = () => {
    return <Header navLinks={caregiverNavLinks} />
}

export default CaregiverHeader
