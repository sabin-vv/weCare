import styles from './Button.module.css'
import type { ButtonProps } from './Button.types'

const Button = ({
    children,
    isLoading,
    disabled,
    variant = 'primary',
    size = 'md',
    fullWidth = true,
    leftIcon,
    className = '',
    ...props
}: ButtonProps) => {
    const composedClassName = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <button className={composedClassName} disabled={isLoading || disabled} {...props}>
            {isLoading ? (
                <span className={styles.loader}></span>
            ) : (
                <>
                    {leftIcon && leftIcon}
                    {children}
                </>
            )}
        </button>
    )
}

export default Button
