import styles from './CaregiverWorkspacePage.module.css'

const CaregiverReminders = () => {
    return (
        <section className={styles.page}>
            <span className={styles.eyebrow}>Reminders</span>
            <h1 className={styles.title}>Reminder tools will live here.</h1>
            <p className={styles.description}>
                Use this area for medication reminders, shift prompts, and follow-up notifications as the caregiver
                module grows.
            </p>
        </section>
    )
}

export default CaregiverReminders
