import { useNavigate } from 'react-router-dom'

import Header from '../components/Header'

import styles from './LandingPage.module.css'

import Button from '@/shared/components/Button/Button'
import Footer from '@/shared/components/Footer/Footer'

const LandingPage = () => {
    const navigate = useNavigate()

    return (
        <div className={styles.landingContainer}>
            <Header />
            <section className={styles.heroSection}>
                <div className={styles.heroInner}>
                    <h1 className={styles.heroTitle}>
                        Healthcare coordination <br />
                        <span className={styles.highlightText}>made simple</span>
                    </h1>

                    <p className={styles.heroSubtitle}>
                        WeCare connects doctors, patients and caregivers into one
                        <br />
                        platform for appointments, prescriptions and medication tracking.
                    </p>

                    <div className={styles.buttonGroup}>
                        <Button onClick={() => navigate('/auth/login')}>Get Started</Button>
                    </div>

                    <div className={styles.heroCards}>
                        <div className={styles.heroCard}>
                            <div className={styles.cardIcon}>🩺</div>
                            <h3>Doctor</h3>
                            <p>Manage patients, issue prescriptions and monitor medication progress.</p>
                        </div>

                        <div className={styles.heroCard}>
                            <div className={styles.cardIcon}>🧑</div>
                            <h3>Patient</h3>
                            <p>Book appointments and track prescriptions easily.</p>
                        </div>

                        <div className={styles.heroCard}>
                            <div className={styles.cardIcon}>🤝</div>
                            <h3>Caregiver</h3>
                            <p>Follow medication plans and update treatment progress.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.worksSection}>
                <h2 className={styles.worksTitle}>How WeCare Works</h2>
                <div className={styles.worksGrid}>
                    <div className={styles.worksCard}>
                        <div className={styles.worksNumber}>01</div>
                        <h4>Book Appointment</h4>
                        <p>Patient selects doctor and schedules consultation.</p>
                    </div>

                    <div className={styles.worksCard}>
                        <div className={styles.worksNumber}>02</div>
                        <h4>Doctor Consultation</h4>
                        <p>Doctor issues digital prescription and treatment plan.</p>
                    </div>

                    <div className={styles.worksCard}>
                        <div className={styles.worksNumber}>03</div>
                        <h4>Caregiver Receives Plan</h4>
                        <p>Medication schedule flows directly to caregiver.</p>
                    </div>

                    <div className={styles.worksCard}>
                        <div className={styles.worksNumber}>04</div>
                        <h4>Track Medication</h4>
                        <p>Dose completion logged and monitored in real time.</p>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    )
}

export default LandingPage
