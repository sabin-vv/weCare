import type { VerificationCardProps } from '../types/auth.types'
import styles from './VerificationCard.module.css'

const VerificationCard = ({ title, description, children }: VerificationCardProps) => {
    return (
        <div className={styles.cardWrapper}>
            <div className={styles.cardHeading}>
                <h3>{title}</h3>
                <p className={styles.description}>{description}</p>
            </div>
            {children}
        </div>
    )
}

export default VerificationCard
