import styles from './Button.module.css'
import type { ButtonProps } from './Button.types'

const Button = ({ children, ...props }: ButtonProps) => {
    return (
        <button className={styles.button} {...props}>
            {children}
        </button>
    )
}

export default Button
