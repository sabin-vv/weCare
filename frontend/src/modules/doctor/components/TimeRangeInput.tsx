import { Trash2 } from 'lucide-react'
import { useEffect } from 'react'

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

const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
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
const lastEndTimeMinutes = 23 * 60 + 45
const buildEndTimeOptions = (startTime: string, slotDuration: number, maxEndTime?: string) => {
    const startTotalMinutes = toMinutes(startTime)
    const maxEndMinutes = maxEndTime ? Math.min(toMinutes(maxEndTime), lastEndTimeMinutes) : lastEndTimeMinutes
    const options = []

    for (let nextMinutes = startTotalMinutes + slotDuration; nextMinutes <= maxEndMinutes; nextMinutes += slotDuration) {
        const hours = Math.floor(nextMinutes / 60)
        const minutes = nextMinutes % 60
        options.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`)
    }

    return options
}

const TimeRangeInput = ({
    value,
    slotDuration,
    minStartTime,
    maxEndTime,
    onChange,
    onDelete,
}: TimeRangeInputProps) => {
    const minStartMinutes = minStartTime ? toMinutes(minStartTime) : 0
    const maxStartMinutes = maxEndTime
        ? Math.min(toMinutes(maxEndTime), lastEndTimeMinutes) - slotDuration
        : lastEndTimeMinutes - slotDuration
    const availableStartTimeOptions = startTimeOptions.filter((option) => {
        const optionMinutes = toMinutes(option)
        return optionMinutes >= minStartMinutes && optionMinutes <= maxStartMinutes
    })
    const selectedStartTime = availableStartTimeOptions.includes(value.startTime)
        ? value.startTime
        : (availableStartTimeOptions[0] ?? value.startTime)
    const minimumEndTime = addMinutesToTime(selectedStartTime, slotDuration)
    const endTimeOptions = buildEndTimeOptions(selectedStartTime, slotDuration, maxEndTime)

    const selectedEndTime = endTimeOptions.includes(value.endTime) ? value.endTime : (endTimeOptions[0] ?? minimumEndTime)

    useEffect(() => {
        if (selectedStartTime !== value.startTime || selectedEndTime !== value.endTime) {
            onChange({
                startTime: selectedStartTime,
                endTime: selectedEndTime,
            })
        }
    }, [onChange, selectedEndTime, selectedStartTime, value.endTime, value.startTime])

    return (
        <div className={styles.wrapper}>
            <div className={styles.timeBox}>
                <select
                    value={selectedStartTime}
                    onChange={(e) => {
                        const nextStartTime = e.target.value
                        const nextEndTimeOptions = buildEndTimeOptions(nextStartTime, slotDuration, maxEndTime)
                        const nextMinimumEndTime = addMinutesToTime(nextStartTime, slotDuration)

                        onChange({
                            startTime: nextStartTime,
                            endTime: nextEndTimeOptions.includes(value.endTime) ? value.endTime : nextMinimumEndTime,
                        })
                    }}
                    aria-label="Start time"
                    className={`${styles.input} ${styles.select}`}
                >
                    {availableStartTimeOptions.map((option) => (
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
