import styles from './MainWrapper.module.css'
import type { MainWrapperProps } from './MainWrapper.types'

const MainWrapper = ({ title, subtitle, children }: MainWrapperProps) => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{title}</h1>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>

                <div className={styles.content}>{children}</div>
            </div>
        </div>
    )
}
export default MainWrapper
