import type { DateRangePickerProps } from '../types/doctor.types'

import styles from './DateRangePicker.module.css'

export const DateRangePicker = ({ value, onChange, minDate, maxDate }: DateRangePickerProps) => {
    return (
        <div className={styles.container}>
            <div className={styles.inputGroup}>
                <label className={styles.label}>Start Date</label>
                <input
                    type="date"
                    value={value.start}
                    min={minDate}
                    max={maxDate}
                    onChange={(e) => onChange({ ...value, start: e.target.value })}
                    className={styles.input}
                />
            </div>

            <span className={styles.separator}>—</span>

            <div className={styles.inputGroup}>
                <label className={styles.label}>End Date</label>
                <input
                    type="date"
                    value={value.end}
                    min={value.start || minDate}
                    max={maxDate}
                    onChange={(e) => onChange({ ...value, end: e.target.value })}
                    className={styles.input}
                />
            </div>
        </div>
    )
}
