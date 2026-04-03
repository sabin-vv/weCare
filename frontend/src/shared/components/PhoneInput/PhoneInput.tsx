import { PhoneInput as InternationalPhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'

import ErrorField from '../ErrorField/ErrorField'

import styles from './PhoneInput.module.css'
import type { PhoneInputProps } from './PhoneInput.types'

const PhoneInput = ({ value, onChange, label, error }: PhoneInputProps) => {
    return (
        <div className={styles.wrapper}>
            {label && <label className={styles.label}>{label}</label>}
            <div className={styles.phoneContainer}>
                <InternationalPhoneInput
                    defaultCountry="in"
                    value={value}
                    onChange={(phone) => onChange(phone)}
                    className={styles.phoneInput}
                />
            </div>
            <ErrorField error={error} />
        </div>
    )
}

export default PhoneInput
