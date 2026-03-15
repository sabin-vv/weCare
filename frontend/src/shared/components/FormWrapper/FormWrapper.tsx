import type { FormWrapperProps } from '../../../features/auth/types/auth.types'

import styles from './FormWrapper.module.css'

const FormWrapper = ({ title, description, maxWidth, children }: FormWrapperProps) => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.card} style={{ maxWidth: maxWidth || '520px' }}>
                <h2>{title}</h2>
                {description && <p className={styles.description}>{description}</p>}
                {children}
            </div>
        </div>
    )
}

export default FormWrapper
