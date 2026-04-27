import type { StatCardProps } from '../types/admin.types'

import styles from './StatCard.module.css'

const StatCard = ({ title, value, icon }: StatCardProps) => {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <span className={styles.icon}>{icon}</span>
                <p className={styles.title}>{title}</p>
            </div>
            <h3 className={styles.value}>{value}</h3>
        </div>
    )
}
export default StatCard
