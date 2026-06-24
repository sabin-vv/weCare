import { CalendarDays } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import styles from './DateRangePicker.module.css'
import type { DateRangePickerProps } from './DateRangePicker.types'

import DatePicker from '@/shared/components/DatePicker/DatePicker'

const shortDate = (d: string) => {
    const date = new Date(d + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const DateRangePicker = ({ value, onChange, minDate, maxDate }: DateRangePickerProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const generatedId = useId()
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        const handlePointerDown = (event: MouseEvent) => {
            if (!wrapperRef.current?.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handlePointerDown)
        return () => document.removeEventListener('mousedown', handlePointerDown)
    }, [isOpen])

    const displayText =
        value.start && value.end ? `${shortDate(value.start)} - ${shortDate(value.end)}` : 'Select date range'

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            <button
                type="button"
                id={`${generatedId}-trigger`}
                className={styles.trigger}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((o) => !o)}
            >
                <CalendarDays size={16} />
                <span className={value.start ? styles.selectedText : styles.placeholder}>{displayText}</span>
            </button>

            {isOpen && (
                <div className={styles.popover} role="dialog" aria-labelledby={`${generatedId}-trigger`}>
                    <div className={styles.pickerRow}>
                        <label className={styles.pickerLabel}>
                            <span className={styles.pickerLabelText}>Start</span>
                            <DatePicker
                                value={value.start}
                                onChange={(v) => onChange({ ...value, start: v })}
                                placeholder="Start"
                                maxDate={value.end ? new Date(value.end + 'T00:00:00') : maxDate}
                            />
                        </label>
                        <label className={styles.pickerLabel}>
                            <span className={styles.pickerLabelText}>End</span>
                            <DatePicker
                                value={value.end}
                                onChange={(v) => onChange({ ...value, end: v })}
                                placeholder="End"
                                minDate={value.start ? new Date(value.start + 'T00:00:00') : minDate}
                                maxDate={maxDate}
                            />
                        </label>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DateRangePicker
