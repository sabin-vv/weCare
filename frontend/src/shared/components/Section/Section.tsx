import styles from './Section.module.css'
import type { SectionProps } from './Section.types'

export const Section = ({ title, subtitle, icon, actions, children }: SectionProps) => {
    return (
        <div className={styles.section}>
            {(title || subtitle || actions) && (
                <div className={styles.header}>
                    <div>
                        {title && (
                            <h2 className={styles.title}>
                                {icon && <span className={styles.icon}>{icon}</span>}
                                {title}
                            </h2>
                        )}
                        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                    </div>

                    {actions && <div className={styles.actions}>{actions}</div>}
                </div>
            )}

            <div className={styles.body}>{children}</div>
        </div>
    )
}
