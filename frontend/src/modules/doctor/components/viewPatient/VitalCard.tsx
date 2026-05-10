import type { ReactNode } from 'react'

import styles from './VitalCard.module.css'

interface VitalCardProps {
    icon: ReactNode
    vitalName: string
    value: string
    unit: string
    status: string
}

const VitalCard = ({ icon, vitalName, value, unit, status }: VitalCardProps) => {
    return (
        <div className={styles.card}>
            <div className={styles.topSection}>
                <div className={styles.iconWrapper}>{icon}</div>

                <span className={styles.status}>{status}</span>
            </div>

            <div className={styles.content}>
                <p className={styles.label}>{vitalName} </p>

                <div className={styles.valueRow}>
                    <h2 className={styles.value}>{value}</h2>

                    <span className={styles.unit}>{unit}</span>
                </div>
            </div>
        </div>
    )
}

export default VitalCard
