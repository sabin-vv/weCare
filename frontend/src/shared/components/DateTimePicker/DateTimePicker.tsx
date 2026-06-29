import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import ErrorField from '../ErrorField/ErrorField'

import styles from './DateTimePicker.module.css'
import type { DateTimePickerProps } from './DateTimePicker.types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const PERIODS = ['AM', 'PM'] as const

const toISO = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

const to24 = (hour12: number, minute: string, period: 'AM' | 'PM'): string => {
    let h = hour12
    if (period === 'PM' && h !== 12) h += 12
    if (period === 'AM' && h === 12) h = 0
    return `${String(h).padStart(2, '0')}:${minute}`
}

const from24 = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    const period = h < 12 ? 'AM' : 'PM'
    return { hour12, minute: String(m).padStart(2, '0'), period: period as 'AM' | 'PM' }
}

const Column = ({
    items,
    selected,
    onSelect,
}: {
    items: readonly (string | number)[]
    selected: string | number
    onSelect: (item: string | number) => void
}) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!ref.current) return
        const el = ref.current.querySelector(`[data-sel="true"]`) as HTMLElement | null
        if (el) el.scrollIntoView({ block: 'center', behavior: 'auto' })
    }, [])

    return (
        <div className={styles.column} ref={ref}>
            <div className={styles.columnPad} />
            {items.map((item) => (
                <button
                    key={item}
                    type="button"
                    data-sel={item === selected}
                    className={`${styles.colItem} ${item === selected ? styles.colItemSel : ''}`}
                    onClick={() => onSelect(item)}
                >
                    {item}
                </button>
            ))}
            <div className={styles.columnPad} />
        </div>
    )
}

const DateTimePicker = ({
    value,
    onChange,
    placeholder = 'Select date & time',
    label,
    error,
    minDate,
    maxDate,
}: DateTimePickerProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const popoverRef = useRef<HTMLDivElement>(null)
    const generatedId = useId()
    const [isOpen, setIsOpen] = useState(false)

    const today = new Date()
    const todayStr = toISO(today)

    const parsedDate = value?.date ? new Date(value.date + 'T00:00:00') : today
    const [viewYear, setViewYear] = useState(parsedDate.getFullYear())
    const [viewMonth, setViewMonth] = useState(parsedDate.getMonth())
    const [tempDate, setTempDate] = useState(value?.date || '')

    const parsedTime = value?.time ? from24(value.time) : { hour12: 12, minute: '00', period: 'AM' as const }
    const [hour12, setHour12] = useState(parsedTime.hour12)
    const [minute, setMinute] = useState(parsedTime.minute)
    const [period, setPeriod] = useState<'AM' | 'PM'>(parsedTime.period)

    useEffect(() => {
        if (isOpen) {
            if (value?.date) {
                const d = new Date(value.date + 'T00:00:00')
                setViewYear(d.getFullYear())
                setViewMonth(d.getMonth())
                setTempDate(value.date)
            } else {
                setTempDate('')
            }
            if (value?.time) {
                const p = from24(value.time)
                setHour12(p.hour12)
                setMinute(p.minute)
                setPeriod(p.period)
            } else {
                setHour12(12)
                setMinute('00')
                setPeriod('AM')
            }
        }
    }, [isOpen])

    useLayoutEffect(() => {
        if (!isOpen || !wrapperRef.current || !popoverRef.current) return

        const poser = () => {
            const rect = wrapperRef.current?.getBoundingClientRect()
            const popover = popoverRef.current
            if (!rect || !popover) return

            const spaceBelow = window.innerHeight - rect.bottom
            const spaceAbove = rect.top
            const popoverHeight = popover.offsetHeight

            if (spaceBelow >= popoverHeight + 8 || spaceBelow >= spaceAbove) {
                popover.style.top = `${rect.bottom + 8}px`
            } else {
                popover.style.top = `${rect.top - 8 - popoverHeight}px`
            }
            popover.style.left = `${rect.left}px`
        }

        poser()
        window.addEventListener('scroll', poser, { passive: true })
        window.addEventListener('resize', poser, { passive: true })

        return () => {
            window.removeEventListener('scroll', poser)
            window.removeEventListener('resize', poser)
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return
        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target as Node
            const inWrapper = wrapperRef.current?.contains(target)
            const inPopup = popoverRef.current?.contains(target)
            if (!inWrapper && !inPopup) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handlePointerDown)
        return () => document.removeEventListener('mousedown', handlePointerDown)
    }, [isOpen])

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()

    const isDisabled = (day: number) => {
        const d = new Date(viewYear, viewMonth, day)
        if (minDate && d < minDate) return true
        if (maxDate && d > maxDate) return true
        return false
    }

    const canGoPrev = !minDate || new Date(viewYear, viewMonth, 0) >= minDate
    const canGoNext = !maxDate || new Date(viewYear, viewMonth + 1, 1) <= maxDate

    const renderDays = () => {
        const cells: React.ReactNode[] = []
        for (let i = 0; i < firstDayOfWeek; i++) {
            cells.push(<div key={`e-${i}`} className={styles.dayCell} />)
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = toISO(new Date(viewYear, viewMonth, day))
            const isToday = dateStr === todayStr
            const isSelected = dateStr === tempDate
            const disabled = isDisabled(day)
            cells.push(
                <button
                    key={day}
                    type="button"
                    disabled={disabled}
                    className={`${styles.dayCell} ${styles.dayBtn} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''} ${disabled ? styles.disabled : ''}`}
                    onClick={() => setTempDate(dateStr)}
                >
                    {day}
                </button>,
            )
        }
        return cells
    }

    const commit = () => {
        if (!tempDate) return
        onChange?.({ date: tempDate, time: to24(hour12, minute, period) })
        setIsOpen(false)
    }

    const displayText =
        value?.date && value?.time
            ? (() => {
                  const p = from24(value.time)
                  return `${new Date(value.date + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}, ${p.hour12}:${p.minute} ${p.period}`
              })()
            : ''

    return (
        <div className={styles.fieldWrapper}>
            {label && <label htmlFor={`${generatedId}-trigger`}>{label}</label>}
            <div className={styles.wrapper} ref={wrapperRef}>
                <button
                    type="button"
                    id={`${generatedId}-trigger`}
                    className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen((o) => !o)}
                >
                    <span className={displayText ? styles.selectedText : styles.placeholder}>
                        {displayText || placeholder}
                    </span>
                    <span className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`} aria-hidden="true">
                        <ChevronDown size={16} />
                    </span>
                </button>

                {isOpen &&
                    createPortal(
                        <div
                            className={styles.popover}
                            ref={popoverRef}
                            role="dialog"
                            aria-labelledby={`${generatedId}-trigger`}
                        >
                            <div className={styles.popoverBody}>
                                <div className={styles.calendarSection}>
                                    <div className={styles.calHeader}>
                                        <button
                                            type="button"
                                            className={styles.navBtn}
                                            disabled={!canGoPrev}
                                            onClick={() => {
                                                if (viewMonth === 0) {
                                                    setViewMonth(11)
                                                    setViewYear((y) => y - 1)
                                                } else setViewMonth((m) => m - 1)
                                            }}
                                        >
                                            &#8249;
                                        </button>
                                        <span className={styles.calTitle}>
                                            {MONTHS[viewMonth]} {viewYear}
                                        </span>
                                        <button
                                            type="button"
                                            className={styles.navBtn}
                                            disabled={!canGoNext}
                                            onClick={() => {
                                                if (viewMonth === 11) {
                                                    setViewMonth(0)
                                                    setViewYear((y) => y + 1)
                                                } else setViewMonth((m) => m + 1)
                                            }}
                                        >
                                            &#8250;
                                        </button>
                                    </div>
                                    <div className={styles.dayRow}>
                                        {DAYS.map((d) => (
                                            <div key={d} className={styles.dayLabel}>
                                                {d}
                                            </div>
                                        ))}
                                    </div>
                                    <div className={styles.grid}>{renderDays()}</div>
                                </div>

                                <div className={styles.timeSection}>
                                    <div className={styles.timeColumns}>
                                        <Column
                                            items={HOURS}
                                            selected={hour12}
                                            onSelect={(v) => setHour12(v as number)}
                                        />

                                        <Column
                                            items={MINUTES}
                                            selected={minute}
                                            onSelect={(v) => setMinute(v as string)}
                                        />
                                        <Column
                                            items={PERIODS}
                                            selected={period}
                                            onSelect={(v) => setPeriod(v as 'AM' | 'PM')}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="button" className={styles.doneBtn} onClick={commit} disabled={!tempDate}>
                                Done
                            </button>
                        </div>,
                        document.body,
                    )}
            </div>
            <ErrorField error={error} />
        </div>
    )
}

export default DateTimePicker
