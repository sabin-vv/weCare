import type { NavLink } from '@/shared/components/Header/Header.types'

export const patientNavLinks: NavLink[] = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Book a doctor', path: '/doctors' },
    { label: 'Appointments', path: '/appointments' },
    { label: 'Wallet', path: '/wallet' },
    { label: 'Care Team', path: '/care-team' },
]

export const caregiverNavLinks: NavLink[] = [
    { label: 'Dashboard', path: '/caregiver/dashboard' },
    { label: 'Patients', path: '/caregiver/patients' },
    { label: 'Alerts', path: '/caregiver/alerts' },
    { label: 'Reminders', path: '/caregiver/reminders' },
    { label: 'Activity Log', path: '/caregiver/activity-log' },
]

export const doctorNavLinks: NavLink[] = [
    { label: 'Dashboard', path: '/doctor/dashboard' },
    { label: 'Patient List', path: '/doctor/patients' },
    { label: 'Appointments', path: '/doctor/appointments' },
    { label: 'Schedule', path: '/doctor/availability' },
    { label: 'Alerts', path: '/doctor/alerts' },
]
