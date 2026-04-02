import ErrorField from '../ErrorField/ErrorField'

import styles from './SelectField.module.css'
import type { SelectFieldProps } from './SelectField.types'

const SelectField = ({ label, id, options, errors, ...rest }: SelectFieldProps) => {
    return (
        <div className={styles.selectWrapper}>
            {label && (
                <label htmlFor={id} className={styles.label}>
                    {label}
                </label>
            )}
            <div className={styles.selectContainer}>
                <select id={id} className={styles.select} {...rest}>
                    <option value="">Select</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <span className={styles.arrow}>▼</span>
            </div>
            <ErrorField error={errors} />
        </div>
    )
}

export default SelectField
