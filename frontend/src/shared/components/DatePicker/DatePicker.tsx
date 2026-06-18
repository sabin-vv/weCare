import { ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import styles from './DatePicker.module.css'
import type { DatePickerProps } from './DatePicker.types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const YEAR_MIN = 1900
const YEAR_MAX = 2100

const toISO = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

const isValidDate = (d: unknown): d is Date => d instanceof Date && !isNaN(d.getTime())

type ViewMode = 'day' | 'year'

const DatePicker = ({ value, onChange, placeholder = 'Select date', minDate, maxDate }: DatePickerProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const yearListRef = useRef<HTMLDivElement>(null)
    const selectedYearRef = useRef<HTMLButtonElement>(null)
    const generatedId = useId()
    const [isOpen, setIsOpen] = useState(false)
    const [viewMode, setViewMode] = useState<ViewMode>('day')

    const selectedDate = value ? new Date(value + 'T00:00:00') : null
    const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? new Date().getMonth())
    const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() ?? new Date().getFullYear())
    const today = new Date()
    const todayStr = toISO(today)

    const handleSelectDay = (day: number) => {
        const picked = new Date(viewYear, viewMonth, day)
        onChange?.(toISO(picked))
        setIsOpen(false)
    }

    const handleSelectYear = (year: number) => {
        setViewYear(year)
        setViewMode('day')
    }

    const handleSelectToday = () => {
        onChange?.(todayStr)
        setIsOpen(false)
    }

    const goToPrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11)
            setViewYear((y) => y - 1)
        } else {
            setViewMonth((m) => m - 1)
        }
    }

    const goToNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0)
            setViewYear((y) => y + 1)
        } else {
            setViewMonth((m) => m + 1)
        }
    }

    const toggleViewMode = () => {
        setViewMode((m) => (m === 'day' ? 'year' : 'day'))
    }

    useEffect(() => {
        if (!isOpen) return
        setViewMode('day')
        const handlePointerDown = (event: MouseEvent) => {
            if (!wrapperRef.current?.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handlePointerDown)
        return () => document.removeEventListener('mousedown', handlePointerDown)
    }, [isOpen])

    useEffect(() => {
        if (viewMode === 'year' && selectedYearRef.current) {
            selectedYearRef.current.scrollIntoView({ block: 'center' })
        }
    }, [viewMode])

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()

    const isDisabled = useCallback(
        (day: number) => {
            const d = new Date(viewYear, viewMonth, day)
            if (minDate && d < minDate) return true
            if (maxDate && d > maxDate) return true
            return false
        },
        [viewYear, viewMonth, minDate, maxDate],
    )

    const renderDays = () => {
        const cells: React.ReactNode[] = []
        for (let i = 0; i < firstDayOfWeek; i++) {
            cells.push(<div key={`empty-${i}`} className={styles.dayCell} />)
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = toISO(new Date(viewYear, viewMonth, day))
            const isToday = dateStr === todayStr
            const isSelected = selectedDate && dateStr === toISO(selectedDate)
            const disabled = isDisabled(day)
            cells.push(
                <button
                    key={day}
                    type="button"
                    className={`${styles.dayCell} ${styles.dayBtn} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''} ${disabled ? styles.disabled : ''}`}
                    disabled={disabled}
                    onClick={() => handleSelectDay(day)}
                >
                    {day}
                </button>,
            )
        }
        return cells
    }

    const renderYears = () => {
        const cells: React.ReactNode[] = []
        const selectedYear = selectedDate?.getFullYear()
        for (let year = YEAR_MIN; year <= YEAR_MAX; year++) {
            const isSelected = selectedYear === year
            cells.push(
                <button
                    key={year}
                    ref={isSelected ? selectedYearRef : null}
                    type="button"
                    className={`${styles.yearBtn} ${isSelected ? styles.selected : ''}`}
                    onClick={() => handleSelectYear(year)}
                >
                    {year}
                </button>,
            )
        }
        return cells
    }

    const displayText =
        selectedDate && isValidDate(selectedDate)
            ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : ''

    const headerLabel = viewMode === 'day' ? `${MONTHS[viewMonth]} ${viewYear}` : '\u2039 Select year'

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
                <span className={displayText ? styles.selectedText : styles.placeholder}>
                    {displayText || placeholder}
                </span>
                <span className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`} aria-hidden="true">
                    <ChevronDown size={16} />
                </span>
            </button>

            {isOpen && (
                <div className={styles.popover} role="dialog" aria-labelledby={`${generatedId}-trigger`}>
                    <div className={styles.header}>
                        {viewMode === 'day' ? (
                            <>
                                <button
                                    type="button"
                                    className={styles.navBtn}
                                    onClick={goToPrevMonth}
                                    aria-label="Previous month"
                                >
                                    &#8249;
                                </button>
                                <button type="button" className={styles.headerTitleBtn} onClick={toggleViewMode}>
                                    {headerLabel}
                                </button>
                                <button
                                    type="button"
                                    className={styles.navBtn}
                                    onClick={goToNextMonth}
                                    aria-label="Next month"
                                >
                                    &#8250;
                                </button>
                            </>
                        ) : (
                            <button type="button" className={styles.headerTitleBtn} onClick={toggleViewMode}>
                                {headerLabel}
                            </button>
                        )}
                    </div>

                    {viewMode === 'day' && (
                        <>
                            <div className={styles.dayRow}>
                                {DAYS.map((d) => (
                                    <div key={d} className={styles.dayLabel}>
                                        {d}
                                    </div>
                                ))}
                            </div>
                            <div className={styles.grid}>{renderDays()}</div>
                            <button type="button" className={styles.todayBtn} onClick={handleSelectToday}>
                                Today
                            </button>
                        </>
                    )}

                    {viewMode === 'year' && (
                        <div className={styles.yearList} ref={yearListRef}>
                            {renderYears()}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default DatePicker
