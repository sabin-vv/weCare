import styles from './Card.module.css'
import type { CardProps } from './Card.type'

const Card = ({ title, description, children }: CardProps) => {
    return (
        <div className={styles.cardWrapper}>
            <div className={styles.cardHeading}>
                <h3>{title}</h3>
                {description && <p className={styles.description}>{description}</p>}
            </div>
            <div>{children}</div>
        </div>
    )
}

export default Card
