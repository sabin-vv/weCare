import { Check, ChevronDown } from 'lucide-react'
import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FocusEvent, KeyboardEvent, Ref } from 'react'

import ErrorField from '../ErrorField/ErrorField'

import styles from './SelectField.module.css'
import type { SelectFieldProps } from './SelectField.types'

const assignRef = <T,>(ref: Ref<T> | undefined, value: T) => {
    if (!ref) return

    if (typeof ref === 'function') {
        ref(value)
        return
    }

    const objectRef = ref as { current: T }

    objectRef.current = value
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
    ({ label, id, options, errors, className, disabled, value, defaultValue, onChange, onBlur, ...rest }, ref) => {
        const generatedId = useId()
        const selectId = id ?? generatedId
        const listboxId = `${selectId}-listbox`
        const wrapperRef = useRef<HTMLDivElement | null>(null)
        const selectRef = useRef<HTMLSelectElement | null>(null)
        const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
        const isControlled = value !== undefined
        const [internalValue, setInternalValue] = useState(String(defaultValue ?? options[0]?.value ?? ''))
        const [isOpen, setIsOpen] = useState(false)

        const selectedValue = isControlled ? String(value ?? '') : internalValue
        const selectedIndex = Math.max(
            options.findIndex((option) => option.value === selectedValue),
            0,
        )
        const [highlightedIndex, setHighlightedIndex] = useState(selectedIndex)

        const selectedOption = useMemo(
            () => options.find((option) => option.value === selectedValue) ?? options[0],
            [options, selectedValue],
        )

        const measureRef = useRef<HTMLDivElement | null>(null)
        const [wrapperMinWidth, setWrapperMinWidth] = useState(0)

        useEffect(() => {
            if (!measureRef.current) return
            const maxWidth = Math.max(
                ...options.map((opt) => {
                    const span = measureRef.current!.querySelector(`[data-label="${opt.label}"]`) as HTMLElement | null
                    return span?.offsetWidth ?? 0
                }),
            )
            const EXTRA = 80
            setWrapperMinWidth(maxWidth ? maxWidth + EXTRA : 0)
        }, [options])

        useEffect(() => {
            if (!isControlled) {
                setInternalValue(String(defaultValue ?? options[0]?.value ?? ''))
            }
        }, [defaultValue, isControlled, options])

        useEffect(() => {
            setHighlightedIndex(selectedIndex)
        }, [selectedIndex])

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

        useEffect(() => {
            if (!isOpen) return

            optionRefs.current[highlightedIndex]?.focus()
        }, [highlightedIndex, isOpen])

        const emitChange = (nextValue: string) => {
            const nextOption = options.find((option) => option.value === nextValue)
            const selectElement = selectRef.current

            if (nextOption?.disabled) return

            if (!isControlled) {
                setInternalValue(nextValue)
            }

            if (selectElement) {
                selectElement.value = nextValue
            }

            if (onChange) {
                onChange({
                    target: {
                        value: nextValue,
                        name: rest.name,
                    },
                    currentTarget: selectElement,
                } as ChangeEvent<HTMLSelectElement>)
            }

            setIsOpen(false)

            if (nextOption && selectElement) {
                selectElement.focus()
            }
        }

        const openDropdown = () => {
            if (disabled || options.length === 0) return

            setHighlightedIndex(selectedIndex)
            setIsOpen(true)
        }

        const moveHighlight = (direction: 1 | -1) => {
            if (!options.length) return

            setHighlightedIndex((current) => {
                const baseIndex = current < 0 ? selectedIndex : current
                return (baseIndex + direction + options.length) % options.length
            })
        }

        const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setIsOpen(false)
                setHighlightedIndex(selectedIndex)
                onBlur?.({
                    ...event,
                    target: selectRef.current as EventTarget & HTMLSelectElement,
                    currentTarget: selectRef.current as EventTarget & HTMLSelectElement,
                } as FocusEvent<HTMLSelectElement>)
            }
        }

        const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
            if (disabled) return

            if (event.key === 'ArrowDown') {
                event.preventDefault()
                if (!isOpen) {
                    openDropdown()
                    return
                }

                moveHighlight(1)
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault()
                if (!isOpen) {
                    openDropdown()
                    return
                }

                moveHighlight(-1)
            }

            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                if (!isOpen) {
                    openDropdown()
                    return
                }

                emitChange(options[highlightedIndex]?.value ?? selectedValue)
            }

            if (event.key === 'Escape') {
                setIsOpen(false)
                setHighlightedIndex(selectedIndex)
            }
        }

        const handleOptionKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
            if (event.key === 'ArrowDown') {
                event.preventDefault()
                moveHighlight(1)
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault()
                moveHighlight(-1)
            }

            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                emitChange(options[index].value)
            }

            if (event.key === 'Escape') {
                event.preventDefault()
                setIsOpen(false)
                setHighlightedIndex(selectedIndex)
                selectRef.current?.focus()
            }
        }

        return (
            <div
                className={styles.selectWrapper}
                ref={wrapperRef}
                onBlur={handleBlur}
                style={wrapperMinWidth ? { minWidth: wrapperMinWidth } : undefined}
            >
                {label && (
                    <label htmlFor={selectId} className={styles.label} id={`${selectId}-label`}>
                        {label}
                    </label>
                )}

                <div className={styles.selectContainer}>
                    <select
                        {...rest}
                        id={selectId}
                        ref={(node) => {
                            selectRef.current = node
                            assignRef(ref, node)
                        }}
                        disabled={disabled}
                        aria-hidden="true"
                        tabIndex={-1}
                        value={selectedValue}
                        onChange={() => undefined}
                        className={styles.nativeSelect}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value} disabled={option.disabled}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        className={`${styles.trigger} ${errors ? styles.triggerError : ''} ${className ?? ''}`.trim()}
                        aria-haspopup="listbox"
                        aria-expanded={isOpen}
                        aria-controls={listboxId}
                        aria-invalid={errors ? 'true' : 'false'}
                        aria-activedescendant={isOpen ? `${selectId}-option-${highlightedIndex}` : undefined}
                        aria-labelledby={label ? `${selectId}-label` : undefined}
                        disabled={disabled}
                        onClick={() => {
                            if (isOpen) {
                                setIsOpen(false)
                                setHighlightedIndex(selectedIndex)
                                return
                            }

                            openDropdown()
                        }}
                        onKeyDown={handleTriggerKeyDown}
                    >
                        <span className={selectedValue === '' ? styles.placeholderText : styles.selectedText}>{selectedOption?.label ?? 'Select an option'}</span>
                        <span className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`} aria-hidden="true">
                            <ChevronDown size={16} />
                        </span>
                    </button>

                    {isOpen && !disabled && (
                        <div className={styles.dropdown} role="listbox" id={listboxId}>
                            {options.map((option) => {
                                const isSelected = option.value === selectedValue
                                const optionIndex = options.findIndex((item) => item.value === option.value)
                                const isHighlighted = optionIndex === highlightedIndex
                                const isDisabled = option.disabled

                                return (
                                    <button
                                        key={option.value}
                                        id={`${selectId}-option-${optionIndex}`}
                                        type="button"
                                        role="option"
                                        disabled={isDisabled}
                                        aria-selected={isSelected}
                                        ref={(node) => {
                                            optionRefs.current[optionIndex] = node
                                        }}
                                        className={`${styles.option} ${isHighlighted ? styles.optionHighlighted : ''} ${isSelected ? styles.optionSelected : ''} ${isDisabled ? styles.optionDisabled : ''}`}
                                        tabIndex={isHighlighted ? 0 : -1}
                                        onMouseEnter={() => {
                                            if (isDisabled) return
                                            setHighlightedIndex(optionIndex)
                                        }}
                                        onClick={() => {
                                            if (isDisabled) return
                                            emitChange(option.value)
                                        }}
                                        onKeyDown={(event) => handleOptionKeyDown(event, optionIndex)}
                                    >
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{option.label}</span>
                                        {isSelected && (
                                            <span className={styles.optionIndicator} aria-hidden="true">
                                                <Check size={14} strokeWidth={2.5} />
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                <ErrorField error={errors} />

                <div
                    ref={measureRef}
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        visibility: 'hidden',
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                        fontSize: 14,
                        fontWeight: 500,
                        top: 0,
                        left: 0,
                    }}
                >
                    {options.map((opt) => (
                        <span key={opt.label} data-label={opt.label}>
                            {opt.label}
                        </span>
                    ))}
                </div>
            </div>
        )
    },
)

SelectField.displayName = 'SelectField'

export default SelectField
