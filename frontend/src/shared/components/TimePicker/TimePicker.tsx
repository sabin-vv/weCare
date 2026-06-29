import { ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

import ErrorField from '../ErrorField/ErrorField'

import styles from './TimePicker.module.css'
import type { TimePickerProps } from './TimePicker.types'

const to24 = (hour12: number, minute: string, period: 'AM' | 'PM'): string => {
    let h = hour12
    if (period === 'PM' && h !== 12) h += 12
    if (period === 'AM' && h === 12) h = 0
    return `${String(h).padStart(2, '0')}:${minute}`
}

const from24 = (value: string) => {
    const [h, m] = value.split(':').map(Number)
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    const period = h < 12 ? 'AM' : 'PM'
    return { hour12, minute: String(m).padStart(2, '0'), period: period as 'AM' | 'PM' }
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const PERIODS = ['AM', 'PM'] as const

const Column = ({
    items,
    selected,
    onSelect,
    itemWidth,
}: {
    items: readonly (string | number)[]
    selected: string | number
    onSelect: (item: string | number) => void
    itemWidth?: string
}) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!ref.current) return
        const selectedEl = ref.current.querySelector(`[data-selected="true"]`) as HTMLElement | null
        if (selectedEl) {
            selectedEl.scrollIntoView({ block: 'center', behavior: 'auto' })
        }
    }, [])

    return (
        <div className={styles.column} ref={ref} style={itemWidth ? { maxWidth: itemWidth } : undefined}>
            <div className={styles.columnPadding} />
            {items.map((item) => (
                <button
                    key={item}
                    type="button"
                    data-selected={item === selected}
                    className={`${styles.columnItem} ${item === selected ? styles.columnItemSelected : ''}`}
                    onClick={() => onSelect(item)}
                >
                    {item}
                </button>
            ))}
            <div className={styles.columnPadding} />
        </div>
    )
}

const TimePicker = ({ value, onChange, placeholder = 'Select time', label, error }: TimePickerProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const generatedId = useId()
    const [isOpen, setIsOpen] = useState(false)

    const parsed = value ? from24(value) : { hour12: 12, minute: '00', period: 'AM' as const }
    const [hour12, setHour12] = useState(parsed.hour12)
    const [minute, setMinute] = useState(parsed.minute)
    const [period, setPeriod] = useState<'AM' | 'PM'>(parsed.period)

    const commit = useCallback(
        (h: number, m: string, p: 'AM' | 'PM') => {
            onChange?.(to24(h, m, p))
        },
        [onChange],
    )

    useEffect(() => {
        if (!isOpen) {
            if (value) {
                const p = from24(value)
                setHour12(p.hour12)
                setMinute(p.minute)
                setPeriod(p.period)
            }
        } else {
            if (value) {
                const p = from24(value)
                setHour12(p.hour12)
                setMinute(p.minute)
                setPeriod(p.period)
            }
        }
    }, [isOpen, value])

    useEffect(() => {
        if (!isOpen) return
        const handlePointerDown = (event: MouseEvent) => {
            if (!wrapperRef.current?.contains(event.target as Node)) {
                commit(hour12, minute, period)
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handlePointerDown)
        return () => document.removeEventListener('mousedown', handlePointerDown)
    }, [isOpen, hour12, minute, period, commit])

    const handleDone = () => {
        commit(hour12, minute, period)
        setIsOpen(false)
    }

    const displayText = value || ''

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

                {isOpen && (
                    <div className={styles.popover} role="dialog" aria-labelledby={`${generatedId}-trigger`}>
                        <div className={styles.columns}>
                            <Column items={HOURS} selected={hour12} onSelect={(item) => setHour12(item as number)} />

                            <Column items={MINUTES} selected={minute} onSelect={(item) => setMinute(item as string)} />
                            <Column
                                items={PERIODS}
                                selected={period}
                                onSelect={(item) => setPeriod(item as 'AM' | 'PM')}
                                itemWidth="60px"
                            />
                        </div>
                        <button type="button" className={styles.doneBtn} onClick={handleDone}>
                            Done
                        </button>
                    </div>
                )}
            </div>
            <ErrorField error={error} />
        </div>
    )
}

export default TimePicker
