import { Trash2 } from 'lucide-react'

import type { TimeRangeInputProps } from '../types/doctor.types'

import styles from './TimeRangeInput.module.css'

const addMinutesToTime = (time: string, minutesToAdd: number) => {
    const [hours, minutes] = time.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + minutesToAdd
    const normalizedMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
    const nextHours = Math.floor(normalizedMinutes / 60)
    const nextMinutes = normalizedMinutes % 60

    return `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`
}

const buildTimeOptions = (stepMinutes: number) => {
    const options = []

    for (let totalMinutes = 0; totalMinutes < 24 * 60; totalMinutes += stepMinutes) {
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        options.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`)
    }

    return options
}

const formatTimeLabel = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const suffix = hours >= 12 ? 'PM' : 'AM'
    const normalizedHours = hours % 12 || 12

    return `${String(normalizedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${suffix}`
}

const startTimeOptions = buildTimeOptions(15)
const buildEndTimeOptions = (startTime: string, slotDuration: number) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number)
    const startTotalMinutes = startHours * 60 + startMinutes
    const options = []

    for (let nextMinutes = startTotalMinutes + slotDuration; nextMinutes < 24 * 60; nextMinutes += slotDuration) {
        const hours = Math.floor(nextMinutes / 60)
        const minutes = nextMinutes % 60
        options.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`)
    }

    return options
}

const TimeRangeInput = ({ value, slotDuration, onChange, onDelete }: TimeRangeInputProps) => {
    const minimumEndTime = addMinutesToTime(value.startTime, slotDuration)
    const endTimeOptions = buildEndTimeOptions(value.startTime, slotDuration)

    const selectedEndTime = endTimeOptions.includes(value.endTime) ? value.endTime : minimumEndTime

    return (
        <div className={styles.wrapper}>
            <div className={styles.timeBox}>
                <select
                    value={value.startTime}
                    onChange={(e) => {
                        const nextStartTime = e.target.value
                        const nextEndTimeOptions = buildEndTimeOptions(nextStartTime, slotDuration)
                        const nextMinimumEndTime = addMinutesToTime(nextStartTime, slotDuration)

                        onChange({
                            startTime: nextStartTime,
                            endTime: nextEndTimeOptions.includes(value.endTime) ? value.endTime : nextMinimumEndTime,
                        })
                    }}
                    aria-label="Start time"
                    className={`${styles.input} ${styles.select}`}
                >
                    {startTimeOptions.map((option) => (
                        <option key={option} value={option}>
                            {formatTimeLabel(option)}
                        </option>
                    ))}
                </select>

                <span className={styles.separator}>to</span>

                <select
                    value={selectedEndTime}
                    onChange={(e) => onChange({ ...value, endTime: e.target.value })}
                    aria-label="End time"
                    className={`${styles.input} ${styles.select}`}
                >
                    {endTimeOptions.map((option) => (
                        <option key={option} value={option}>
                            {formatTimeLabel(option)}
                        </option>
                    ))}
                </select>
            </div>

            {onDelete && (
                <button type="button" onClick={onDelete} className={styles.deleteBtn} aria-label="Delete time range">
                    <Trash2 />
                </button>
            )}
        </div>
    )
}
export default TimeRangeInput
