import type { RoleSelectorProps } from '../types/auth.types'

import styles from './RoleSelector.module.css'

const RoleSelector = ({ role, onChange }: RoleSelectorProps) => {
    return (
        <div className={styles.roleSelectorWrapper}>
            <p>I am signing in as a:</p>
            <div className={styles.roleSelector}>
                <button
                    type="button"
                    className={role === 'doctor' ? styles.active : ''}
                    onClick={() => onChange('doctor')}
                >
                    Doctor
                </button>
                <button
                    type="button"
                    className={role === 'caregiver' ? styles.active : ''}
                    onClick={() => onChange('caregiver')}
                >
                    Caregiver
                </button>
                <button
                    type="button"
                    className={role === 'patient' ? styles.active : ''}
                    onClick={() => onChange('patient')}
                >
                    Patient
                </button>
            </div>
        </div>
    )
}
export default RoleSelector
