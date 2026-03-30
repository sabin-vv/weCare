import { Role, type RoleSelectorProps } from '../types/auth.types'
import styles from './RoleSelector.module.css'

const RoleSelector = ({ role, onChange }: RoleSelectorProps) => {
    return (
        <div className={styles.roleSelectorWrapper}>
            <p>I am signing in as a:</p>
            <div className={styles.roleSelector}>
                <button
                    type="button"
                    className={role === Role.DOCTOR ? styles.active : ''}
                    onClick={() => onChange(Role.DOCTOR)}
                >
                    Doctor
                </button>
                <button
                    type="button"
                    className={role === Role.CAREGIVER ? styles.active : ''}
                    onClick={() => onChange(Role.CAREGIVER)}
                >
                    Caregiver
                </button>
                <button
                    type="button"
                    className={role === Role.PATIENT ? styles.active : ''}
                    onClick={() => onChange(Role.PATIENT)}
                >
                    Patient
                </button>
                <button
                    type="button"
                    className={role === Role.ADMIN ? styles.active : ''}
                    onClick={() => onChange(Role.ADMIN)}
                >
                    Admin
                </button>
            </div>
        </div>
    )
}
export default RoleSelector
