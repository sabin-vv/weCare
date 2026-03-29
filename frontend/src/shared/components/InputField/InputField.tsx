import ErrorField from '../ErrorField/ErrorField'

import styles from './InputField.module.css'
import type { InputFieldProps } from './InputField.types'

const InputField = ({ label, errors, icon, prefix, ...props }: InputFieldProps) => {
    const inputClass = `${styles.input} ${prefix ? styles.withPrefix : ''}`
    return (
        <div className={styles.formFields}>
            <label htmlFor={props.id}>{label}</label>

            <div className={styles.inputWrapper}>
                {(prefix || icon) && (
                    <div className={styles.leftContent}>
                        {icon && <span className={styles.icon}>{icon}</span>}
                        {prefix && <span className={styles.prefix}>{prefix}</span>}
                    </div>
                )}

                <input {...props} className={inputClass} />
            </div>

            <ErrorField error={errors} />
        </div>
    )
}

export default InputField
