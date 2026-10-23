/* eslint-disable react/no-unescaped-entities */
import {
    Stethoscope,
    User,
    HeartHandshake,
    CalendarCheck,
    Video,
    MessageSquareText,
    Pill,
    Bell,
    ArrowRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import styles from './LandingPage.module.css'

import Button from '@/shared/components/Button/Button'

const features = [
    {
        icon: CalendarCheck,
        title: 'Smart Booking',
        description: 'Find and book appointments with the right doctor in seconds.',
    },
    {
        icon: Video,
        title: 'Video Consultations',
        description: 'Secure video calls with doctors from the comfort of your home.',
    },
    {
        icon: MessageSquareText,
        title: 'Real-time Chat',
        description: 'Direct messaging between patients, doctors, and caregivers.',
    },
    {
        icon: Pill,
        title: 'Digital Prescriptions',
        description: 'Paperless prescriptions shared instantly with patients.',
    },
    { icon: Bell, title: 'Medication Reminders', description: 'Automated dose reminders for patients and caregivers.' },
    {
        icon: HeartHandshake,
        title: 'Care Team Coordination',
        description: 'Unified care plans shared across your entire care team.',
    },
]

const works = [
    {
        number: '01',
        icon: CalendarCheck,
        title: 'Book Appointment',
        description: 'Patient selects a doctor and schedules a consultation.',
    },
    {
        number: '02',
        icon: Video,
        title: 'Consult Online',
        description: 'Doctor consults via video or chat and issues a prescription.',
    },
    {
        number: '03',
        icon: HeartHandshake,
        title: 'Caregiver Gets Plan',
        description: 'Medication schedule flows directly to the caregiver.',
    },
    {
        number: '04',
        icon: Bell,
        title: 'Track & Recover',
        description: 'Dose completion logged and monitored in real time.',
    },
]

const LandingPage = () => {
    const navigate = useNavigate()

    return (
        <div className={styles.landingContainer}>
            <section className={styles.heroSection}>
                <div className={styles.landingWrapper}>
                    <div className={styles.heroInner}>
                        <h1 className={styles.heroTitle}>
                            Healthcare coordination <span className={styles.highlightText}>made simple</span>
                        </h1>

                        <p className={styles.heroSubtitle}>
                            WeCare connects doctors, patients, and caregivers into one platform for appointments,
                            prescriptions, and medication tracking.
                        </p>

                        <div className={styles.buttonGroup}>
                            <Button onClick={() => navigate('/auth/login')} fullWidth={false}>
                                Get Started <ArrowRight size={18} />
                            </Button>
                        </div>

                        <div className={styles.roleCards}>
                            <div className={styles.roleCard}>
                                <div className={styles.roleCardHeader}>
                                    <div className={styles.roleIcon}>
                                        <Stethoscope size={24} />
                                    </div>
                                    <h3>Doctor</h3>
                                </div>
                                <p>Manage patients, issue prescriptions, and monitor progress.</p>
                            </div>
                            <div className={styles.roleCard}>
                                <div className={styles.roleCardHeader}>
                                    <div className={styles.roleIcon}>
                                        <User size={24} />
                                    </div>
                                    <h3>Patient</h3>
                                </div>
                                <p>Book appointments and track prescriptions easily.</p>
                            </div>
                            <div className={styles.roleCard}>
                                <div className={styles.roleCardHeader}>
                                    <div className={styles.roleIcon}>
                                        <HeartHandshake size={24} />
                                    </div>
                                    <h3>Caregiver</h3>
                                </div>
                                <p>Follow medication plans and update treatment progress.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.featuresSection}>
                <div className={styles.landingWrapper}>
                    <svg
                        className={styles.ecgLine}
                        viewBox="0 0 200 28"
                        preserveAspectRatio="none"
                        fill="none"
                        aria-hidden="true"
                    >
                        <path
                            d="M0 14 L45 14 L50 4 L55 24 L60 14 L140 14 L145 4 L150 24 L155 14 L200 14"
                            stroke="#2e9b76"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <h2 className={styles.sectionTitle}>Everything you need</h2>
                    <p className={styles.sectionSubtitle}>
                        A complete healthcare coordination platform for every role.
                    </p>
                    <div className={styles.buttonGroup}>
                        <Button
                            fullWidth={false}
                            style={{ background: '#2e9b76', borderColor: '#2e9b76' }}
                            onClick={() => navigate('/doctors')}
                        >
                            Find a Doctor <ArrowRight size={18} />
                        </Button>
                    </div>
                    <div className={styles.featuresGrid}>
                        {features.map((f) => (
                            <div key={f.title} className={styles.featureCard}>
                                <div className={styles.featureCardHeader}>
                                    <div className={styles.featureIconBox}>
                                        <f.icon size={24} />
                                    </div>
                                    <h3>{f.title}</h3>
                                </div>
                                <p>{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={styles.worksSection}>
                <div className={styles.landingWrapper}>
                    <svg
                        className={styles.ecgLine}
                        viewBox="0 0 200 28"
                        preserveAspectRatio="none"
                        fill="none"
                        aria-hidden="true"
                    >
                        <path
                            d="M0 14 L45 14 L50 4 L55 24 L60 14 L140 14 L145 4 L150 24 L155 14 L200 14"
                            stroke="#2e9b76"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <h2 className={styles.sectionTitle}>How WeCare Works</h2>
                    <p className={styles.sectionSubtitle}>From booking to recovery — we've got you covered.</p>
                    <div className={styles.worksGrid}>
                        {works.map((w) => (
                            <div key={w.number} className={styles.worksCard}>
                                <div className={styles.worksNumber}>{w.number}</div>
                                <div className={styles.worksIcon}>
                                    <w.icon size={28} />
                                </div>
                                <h4>{w.title}</h4>
                                <p>{w.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default LandingPage
