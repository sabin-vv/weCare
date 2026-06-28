import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import ErrorField from '../ErrorField/ErrorField'

import styles from './DateRangePicker.module.css'
import type { DateRangePickerProps } from './DateRangePicker.types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const toISO = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

const shortDate = (d: string) => {
    const date = new Date(d + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const DateRangePicker = ({ value, onChange, minDate, maxDate, label, error }: DateRangePickerProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const generatedId = useId()
    const [isOpen, setIsOpen] = useState(false)
    const [selectionPhase, setSelectionPhase] = useState<'idle' | 'start-selected'>('idle')
    const [tempStart, setTempStart] = useState<string | null>(null)
    const [tempEnd, setTempEnd] = useState<string | null>(null)
    const [hoveredDate, setHoveredDate] = useState<string | null>(null)

    const initialDate = value.start ? new Date(value.start + 'T00:00:00') : new Date()
    const [viewDate, setViewDate] = useState(initialDate)

    const viewYear = viewDate.getFullYear()
    const viewMonth = viewDate.getMonth()

    const secondYear = viewMonth === 11 ? viewYear + 1 : viewYear
    const secondMonth = (viewMonth + 1) % 12

    useEffect(() => {
        if (!isOpen) {
            setSelectionPhase('idle')
            setTempStart(null)
            setTempEnd(null)
            setHoveredDate(null)
        } else {
            if (value.start) {
                setTempStart(value.start)
                setSelectionPhase('start-selected')
                setViewDate(new Date(value.start + 'T00:00:00'))
            }
            if (value.end) {
                setTempEnd(value.end)
            }
        }
    }, [isOpen])

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

    const today = new Date()
    const todayStr = toISO(today)

    const isDisabled = (dateStr: string) => {
        const d = new Date(dateStr + 'T00:00:00')
        if (minDate && d < minDate) return true
        if (maxDate && d > maxDate) return true
        return false
    }

    const handleDayClick = (dateStr: string) => {
        if (selectionPhase === 'idle') {
            setTempStart(dateStr)
            setSelectionPhase('start-selected')
            setTempEnd(null)
            return
        }

        if (dateStr === tempStart) {
            setSelectionPhase('idle')
            setTempStart(null)
            setTempEnd(null)
            return
        }

        const [start, end] = [tempStart!, dateStr].sort()
        onChange({ start, end })
        setIsOpen(false)
    }

    const goToPrevMonth = () => {
        const prev = new Date(viewYear, viewMonth - 1, 1)
        if (minDate && new Date(prev.getFullYear(), prev.getMonth() + 1, 0) < minDate) return
        setViewDate(prev)
    }

    const goToNextMonth = () => {
        const next = new Date(viewYear, viewMonth + 1, 1)
        const secondMonth = new Date(viewYear, viewMonth + 2, 1)
        if (maxDate && secondMonth > maxDate) return
        setViewDate(next)
    }

    const renderMonth = (year: number, month: number) => {
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const startOffset = new Date(year, month, 1).getDay()
        const cells: React.ReactNode[] = []

        for (let i = 0; i < startOffset; i++) {
            cells.push(<div key={`e-${month}-${i}`} className={styles.dayCell} />)
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isToday = dateStr === todayStr
            const disabled = isDisabled(dateStr)

            const activeEnd = tempEnd || hoveredDate
            const isRangeStart = tempStart === dateStr
            const isRangeEnd = activeEnd && tempStart && activeEnd === dateStr && dateStr !== tempStart
            const isInRange = tempStart && activeEnd && tempStart < dateStr && dateStr < activeEnd

            let rangeClass = ''
            if (!disabled) {
                if (tempStart && tempStart === activeEnd && tempStart === dateStr) {
                    rangeClass = styles.selected
                } else if (isRangeStart) {
                    rangeClass = dateStr < activeEnd! ? styles.rangeStart : styles.selected
                } else if (isInRange) {
                    rangeClass = styles.inRange
                } else if (isRangeEnd) {
                    rangeClass = styles.rangeEnd
                }
            }

            const cellClass =
                `${styles.dayCell} ${styles.dayBtn} ${isToday ? styles.today : ''} ${rangeClass} ${disabled ? styles.disabled : ''}`.trim()

            cells.push(
                <button
                    key={dateStr}
                    type="button"
                    className={cellClass}
                    disabled={disabled}
                    onClick={() => handleDayClick(dateStr)}
                    onMouseEnter={() => {
                        if (selectionPhase === 'start-selected') setHoveredDate(dateStr)
                    }}
                    onMouseLeave={() => setHoveredDate(null)}
                >
                    {day}
                </button>,
            )
        }

        return cells
    }

    const displayText =
        value.start && value.end
            ? `${shortDate(value.start)} - ${shortDate(value.end)}`
            : value.start
              ? `From ${shortDate(value.start)}`
              : 'Select date range'

    const firstLabel = `${MONTHS[viewMonth]} ${viewYear}`
    const secondLabel = `${MONTHS[secondMonth]} ${secondYear}`

    return (
        <div className={styles.fieldWrapper}>
            {label && <label htmlFor={`${generatedId}-trigger`}>{label}</label>}
            <div className={styles.wrapper} ref={wrapperRef}>
                <button
                    type="button"
                    id={`${generatedId}-trigger`}
                    className={styles.trigger}
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen((o) => !o)}
                >
                    <span className={value.start ? styles.selectedText : styles.placeholder}>{displayText}</span>
                    <span className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`} aria-hidden="true">
                        <ChevronDown size={16} />
                    </span>
                </button>

                {isOpen && (
                    <div className={styles.popover} role="dialog" aria-labelledby={`${generatedId}-trigger`}>
                        <div className={styles.header}>
                            <button
                                type="button"
                                className={styles.navBtn}
                                onClick={goToPrevMonth}
                                aria-label="Previous month"
                            >
                                &#8249;
                            </button>
                            <span className={styles.headerTitle}>{firstLabel}</span>
                            <span className={styles.headerTitle}>{secondLabel}</span>
                            <button
                                type="button"
                                className={styles.navBtn}
                                onClick={goToNextMonth}
                                aria-label="Next month"
                            >
                                &#8250;
                            </button>
                        </div>

                        <div className={styles.monthsRow}>
                            <div>
                                <div className={styles.dayRow}>
                                    {DAYS.map((d) => (
                                        <div key={d} className={styles.dayLabel}>
                                            {d}
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.grid}>{renderMonth(viewYear, viewMonth)}</div>
                            </div>
                            <div>
                                <div className={styles.dayRow}>
                                    {DAYS.map((d) => (
                                        <div key={d} className={styles.dayLabel}>
                                            {d}
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.grid}>{renderMonth(secondYear, secondMonth)}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <ErrorField error={error} />
        </div>
    )
}

export default DateRangePicker
