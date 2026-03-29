import type { ProgressBarProps } from '../types/auth.types'
import styles from './ProgressBar.module.css'

const ProgressBar = ({ step, percentage, totalSteps, title }: ProgressBarProps) => {
    return (
        <div className={styles.progressWrapper}>
            <div className={styles.progressTextWrapper}>
                <p className={styles.step}>
                    Step {step} of {totalSteps} : {title}
                </p>
                <p className={styles.progressText}>{percentage}% Completed</p>
            </div>
            <progress value={percentage} max={100} />
        </div>
    )
}

export default ProgressBar
