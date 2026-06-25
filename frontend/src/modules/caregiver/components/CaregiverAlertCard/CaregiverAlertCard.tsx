import type { AlertSeverity, AlertStatus } from '../../types/caregiver.types'

import styles from './CaregiverAlertCard.module.css'

interface CaregiverAlertCardProps {
    patientName: string
    message: string
    timestamp: string
    severity: AlertSeverity
    status: AlertStatus
    icon: React.ReactNode
    acknowledgedBy?: string
}

export const CaregiverAlertCard = ({
    patientName,
    message,
    timestamp,
    severity,
    status,
    icon,
    acknowledgedBy,
}: CaregiverAlertCardProps) => {
    return (
        <div
            className={`${styles.card} ${styles[severity]} ${status === 'acknowledged' ? styles.acknowledgedCard : ''}`}
        >
            <div className={styles.top}>
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
                {status === 'open' && <span className={`${styles.statusBadge} ${styles.statusOpen}`}>Open</span>}
                {status === 'acknowledged' && (
                    <span className={`${styles.statusBadge} ${styles.statusAcknowledged}`}>
                        Acknowledged
                        {acknowledgedBy && <span className={styles.ackTime}>{acknowledgedBy}</span>}
                    </span>
                )}
            </div>
        </div>
    )
}
