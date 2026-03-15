import { useState } from 'react'

import type { PasswordFieldProps } from '../../../features/auth/types/auth.types'

import styles from './PasswordField.module.css'

import ErrorField from '@/shared/components/ErrorField/ErrorField'
import EyeIcon from '@/shared/icons/EyeIcon'
import EyeOffIcon from '@/shared/icons/EyeOffIcon'
import PasswordIcon from '@/shared/icons/PasswordIcon'

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
                    <PasswordIcon />
                </span>
                <input {...props} type={showPassword ? 'text' : 'password'} className={styles.input} />
                <button type="button" className={styles.rightIcon} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                </button>
            </div>
            <ErrorField error={error} />
        </div>
    )
}

export default PasswordField
