import styles from './Button.module.css'
import type { ButtonProps } from './Button.types'

const Button = ({ children, isLoading, disabled, ...props }: ButtonProps) => {
    return (
        <button className={styles.button} disabled={isLoading || disabled} {...props}>
            {isLoading ? 'Loading...' : children}
        </button>
    )
}

export default Button
