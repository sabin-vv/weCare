import { Eye, EyeClosed, LockKeyhole } from 'lucide-react'
import { useState } from 'react'

import styles from './PasswordField.module.css'
import type { PasswordFieldProps } from './PasswordField.type'

import ErrorField from '@/shared/components/ErrorField/ErrorField'

const PasswordField = ({ label, onForgotPassword, error, ...props }: PasswordFieldProps) => {
    const [showPassword, setShowPassword] = useState<boolean>(false)
    return (
        <div className={styles.formFields}>
            <div className={styles.passwordWrap}>
                <label>{label}</label>
                {onForgotPassword && (
                    <button type="button" className={styles.forgotPassword} onClick={onForgotPassword}>
                        Forgot Password?
                    </button>
                )}
            </div>
            <div className={styles.inputWrapper}>
                <span className={styles.leftIcon}>
                    <LockKeyhole size={18} />
                </span>
                <input {...props} type={showPassword ? 'text' : 'password'} className={styles.input} />
                <button type="button" className={styles.rightIcon} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
                </button>
            </div>
            <ErrorField error={error} />
        </div>
    )
}

export default PasswordField
