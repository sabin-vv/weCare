import type { AlertCardProps } from '../types/doctor.types'

import styles from './AlertCard.module.css'

export const AlertCard = ({
    patientName,
    message,
    timestamp,
    severity,
    status,
    icon,
    acknowledgedBy,
    onAcknowledge,
}: AlertCardProps) => {
    return (
        <div className={`${styles.card} ${styles[severity]}`}>
            <div className={styles.left}>
                <div className={styles.icon}>{icon}</div>

                <div className={styles.content}>
                    <div className={styles.header}>
                        <span className={styles.name}>{patientName}</span>

                        <span className={styles.badge}>{severity}</span>
                    </div>

                    <p className={styles.message}>{message}</p>

                    <span className={styles.time}>{timestamp}</span>
                </div>
            </div>

            <div className={styles.action}>
                {status === 'open' && <button onClick={onAcknowledge}>Acknowledge</button>}

                {status === 'acknowledged' && (
                    <div className={styles.acknowledged}>
                        ✓ Acknowledged
                        <span>{acknowledgedBy}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
