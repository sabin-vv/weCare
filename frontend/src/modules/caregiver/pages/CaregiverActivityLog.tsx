import styles from './CaregiverWorkspacePage.module.css'

const CaregiverActivityLog = () => {
    return (
        <section className={styles.page}>
            <span className={styles.eyebrow}>Activity Log</span>
            <h1 className={styles.title}>Caregiver activity history will appear here.</h1>
            <p className={styles.description}>
                This page can show completed tasks, timeline updates, and care actions so caregivers have a clear daily
                record.
            </p>
        </section>
    )
}

export default CaregiverActivityLog
