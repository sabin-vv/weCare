import PhoneInputLib from 'react-phone-input-2'
import ErrorField from '../ErrorField/ErrorField'
import 'react-phone-input-2/lib/style.css'
import styles from './PhoneInput.module.css'
import type { PhoneInputProps } from './PhoneInput.types'

const PhoneInput = ({ value, onChange, label, error }: PhoneInputProps) => {
    return (
        <div className={styles.wrapper}>
            {label && <label className={styles.label}>{label}</label>}
            <div className={styles.phoneContainer}>
                <PhoneInputLib
                    country="in"
                    value={value}
                    onChange={onChange}
                    countryCodeEditable={false}
                    containerClass={styles.libContainer}
                    inputClass={styles.libInput}
                    buttonClass={styles.libButton}
                    dropdownClass={styles.libDropdown}
                />
            </div>
            <ErrorField error={error} />
        </div>
    )
}

export default PhoneInput
