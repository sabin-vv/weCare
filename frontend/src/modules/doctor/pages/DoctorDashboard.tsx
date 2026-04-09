import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import DoctorDetailsForm from '../form/DoctorDetailesForm'

import styles from './DoctorDashboard.module.css'

const DoctorDashboard = () => {
    return (
        <div>
            <Navbar />
            <div className={styles.body}>
                <Sidebar />
                <DoctorDetailsForm />
            </div>
        </div>
    )
}

export default DoctorDashboard
