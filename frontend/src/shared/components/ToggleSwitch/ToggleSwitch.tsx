import styles from './ToggleSwitch.module.css'
import type { ToggleSwitchProps } from './ToggleSwitch.types'

export const ToggleSwitch = ({ checked, onChange }: ToggleSwitchProps) => {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            className={`${styles.toggle} ${checked ? styles.active : ''}`}
            onClick={() => onChange(!checked)}
        >
            <div className={styles.thumb} />
        </button>
    )
}
export default ToggleSwitch
