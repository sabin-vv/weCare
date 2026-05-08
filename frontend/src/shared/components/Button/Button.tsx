import styles from './Button.module.css'
import type { ButtonProps } from './Button.types'

const Button = ({ children, isLoading, disabled, variant = 'primary', className = '', ...props }: ButtonProps) => {
    const composedClassName = [styles.button, styles[variant], className].filter(Boolean).join(' ')

    return (
        <button className={composedClassName} disabled={isLoading || disabled} {...props}>
            {isLoading ? 'Loading...' : children}
        </button>
    )
}

export default Button
