import type { PageCardProps } from '../types/admin.types'

import styles from './PageCard.module.css'

const PageCard = ({ title, subtitle, actions, children }: PageCardProps) => {
    return (
        <div className={styles.card}>
            {(title || actions) && (
                <div className={styles.header}>
                    <div>
                        {title && <h2 className={styles.title}>{title}</h2>}
                        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                    </div>

                    {actions && <div className={styles.actions}>{actions}</div>}
                </div>
            )}

            <div className={styles.body}>{children}</div>
        </div>
    )
}

export default PageCard
