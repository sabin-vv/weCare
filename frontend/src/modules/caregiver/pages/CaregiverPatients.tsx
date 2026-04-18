import styles from './CaregiverWorkspacePage.module.css'

const CaregiverPatients = () => {
    return (
        <section className={styles.page}>
            <span className={styles.eyebrow}>Patients</span>
            <h1 className={styles.title}>Patient workspace is ready for caregiver features.</h1>
            <p className={styles.description}>
                This section is prepared for patient assignments, care plans, and daily monitoring once those flows are
                connected.
            </p>
        </section>
    )
}

export default CaregiverPatients
