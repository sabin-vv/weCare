import type { FormWrapperProps } from './FormWrapper.types'

import styles from './FormWrapper.module.css'

const FormWrapper = ({ title, description, maxWidth, children }: FormWrapperProps) => {
    return (
        <main className={styles.wrapper}>
            <div className={styles.card} style={maxWidth ? { maxWidth } : undefined}>
                <h2>{title}</h2>
                {description && <p className={styles.description}>{description}</p>}
                {children}
            </div>
        </main>
    )
}

export default FormWrapper
