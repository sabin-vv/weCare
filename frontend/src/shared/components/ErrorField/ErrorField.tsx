import styles from './ErrorField.module.css'
import type { MessageProps } from './ErrorField.types'

const ErrorField = ({ error }: MessageProps) => {
    return (
        <div className={styles.errorWrapper}>
            <p>{error}</p>
        </div>
    )
}

export default ErrorField
