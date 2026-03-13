import type { ProfessionalButtonsProps } from '../types/auth.types'
import styles from './ProfessionalButtons.module.css'

const ProfessionalButtons = ({ onBack, onNext, nextLabel, backLabel }: ProfessionalButtonsProps) => {
    return (
        <div className={styles.buttonWrapper}>
            <button type="button" className={styles.backButton} onClick={onBack}>
                {backLabel}
            </button>
            <button type="button" className={styles.nextButton} onClick={onNext}>
                {nextLabel}
            </button>
        </div>
    )
}

export default ProfessionalButtons
