import Header from '@/shared/components/Header/Header'

const caregiverNavLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Find Dotors', path: '/doctors' },
    { label: 'Appointments', path: '/appointments' },
    { label: 'Wallet', path: '/wallet' },
]
const PatientHeader = () => {
    return <Header navLinks={caregiverNavLinks} />
}
export default PatientHeader
