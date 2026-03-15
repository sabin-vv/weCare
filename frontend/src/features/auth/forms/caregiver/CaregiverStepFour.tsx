import { useNavigate } from 'react-router-dom'

import ProgressBar from '../../components/ProgressBar'

import styles from './CaregiverStepFour.module.css'

import Button from '@/shared/components/Button/Button'
import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'

const CaregiverStepFour = () => {
    const navigate = useNavigate()

    return (
        <FormWrapper title="Registration Completed">
            <ProgressBar step={4} totalSteps={4} percentage={100} title="Registration Complete" />

            {/* Success Icon */}
            <div className={styles.iconRing}>
                <svg
                    className={styles.checkIcon}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>

            {/* Text */}
            <div className={styles.textBlock}>
                <h2 className={styles.heading}>Application Submitted</h2>
                <p className={styles.subtext}>
                    Thank you for your application to CareCoord Healthcare. Your information has been securely received
                    and is now being processed.
                </p>
            </div>

            <hr className={styles.divider} />

            {/* What Happens Next */}
            <div className={styles.nextSection}>
                <h3 className={styles.nextLabel}>WHAT HAPPENS NEXT?</h3>

                <div className={styles.timeline}>
                    <div className={styles.step}>
                        <div className={styles.stepLeft}>
                            <div className={styles.stepCircle}>1</div>
                            <div className={styles.stepLine}></div>
                        </div>

                        <div className={styles.stepContent}>
                            <p className={styles.stepTitle}>Credential Review</p>
                            <p className={styles.stepDescription}>
                                Our team will verify your identity documents and professional certifications.
                            </p>
                        </div>
                    </div>

                    <div className={styles.step}>
                        <div className={styles.stepLeft}>
                            <div className={styles.stepCircle}>2</div>
                            <div className={styles.stepLine}></div>
                        </div>

                        <div className={styles.stepContent}>
                            <p className={styles.stepTitle}>Internal Verification</p>
                            <p className={styles.stepDescription}>
                                Final background check and clinical validation (24–48 hours).
                            </p>
                        </div>
                    </div>

                    <div className={styles.step}>
                        <div className={styles.stepLeft}>
                            <div className={styles.stepCircle}>3</div>
                        </div>

                        <div className={styles.stepContent}>
                            <p className={styles.stepTitle}>Account Activation</p>
                            <p className={styles.stepDescription}>
                                You will receive an email confirmation once your profile is live and ready for patient
                                matching.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Button onClick={() => navigate('/api/auth/login')}>Back to Login Page</Button>
        </FormWrapper>
    )
}

export default CaregiverStepFour
