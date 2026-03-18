import styles from './SelectField.module.css'
import type { SelectFieldProps } from './SelectField.types'

const SelectField = ({ label, options, errors, ...rest }: SelectFieldProps) => {
    return (
        <div className={styles.selectWrapper}>
            {label && <label className={styles.label}>{label}</label>}
            <select className={styles.select} {...rest}>
                <option value="">Select</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {errors && <p className={styles.errors}>{errors}</p>}
        </div>
    )
}

export default SelectField
