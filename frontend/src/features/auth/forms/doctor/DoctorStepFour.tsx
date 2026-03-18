import { useNavigate } from 'react-router-dom'

import Button from '../../../../shared/components/Button/Button'
import ProgressBar from '../../components/ProgressBar'

import styles from './DoctorStepFour.module.css'

const DoctorStepFour = () => {
    const navigate = useNavigate()
    return (
        <div className={styles.cardWrapper}>
            <ProgressBar step={4} totalSteps={4} title="Account Setup" percentage={100} />
            <div className={styles.successSection}>
                <svg
                    className={styles.svg}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <h3>Application Submitted Successfully!</h3>
                <p>Thank you for joining WeCare. Your profile is now being processed.</p>
            </div>
            <div className={styles.card}>
                <h2>What happens next?</h2>

                <div className={styles.timeline}>
                    <div className={styles.step}>
                        <div className={styles.circle}>1</div>
                        <div className={styles.stepContent}>
                            <h4>Identity & Credential Verification</h4>
                            <p>
                                Our compliance team verifies your information against official registries to ensure a
                                safe and secure environment.
                            </p>
                        </div>
                    </div>

                    <div className={styles.step}>
                        <div className={styles.circle}>2</div>
                        <div className={styles.stepContent}>
                            <h4>Account Activation</h4>
                            <p>
                                Once verified (within 24–48 hours), you will receive your activation email and
                                onboarding guide.
                            </p>
                        </div>
                    </div>

                    <div className={styles.step}>
                        <div className={styles.circle}>3</div>
                        <div className={styles.stepContent}>
                            <h4>Begin Coordination</h4>
                            <p>
                                Log in to your personalized dashboard to start managing care plans and communicating
                                with your healthcare team.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.buttonWrapper}>
                <Button onClick={() => navigate('/api/auth/login')} type="button">
                    Back to Login Page
                </Button>
            </div>
        </div>
    )
}

export default DoctorStepFour
