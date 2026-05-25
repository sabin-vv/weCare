import { useEffect, useRef, useState } from 'react'

import styles from './SearchField.module.css'
import type { SearchFieldProps } from './SearchField.types'

const SearchField = ({
    value,
    placeholder,
    onSearch,
    onChange,
    delay = 500,
    suggestions = [],
    isLoading = false,
    onSelect,
    disabled = false,
}: SearchFieldProps) => {
    const isFirstMount = useRef(true)
    const skipNextSearchRef = useRef(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (!onChange || !onSearch) {
            return
        }

        if (isFirstMount.current) {
            isFirstMount.current = false
            return
        }
        if (skipNextSearchRef.current) {
            skipNextSearchRef.current = false
            return
        }

        const handler = setTimeout(() => {
            onSearch(value)
            setShowSuggestions(true)
        }, delay)

        return () => clearTimeout(handler)
    }, [value, delay, onChange, onSearch])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextValue = e.target.value
        if (onChange) {
            onChange(nextValue)
        } else {
            onSearch?.(nextValue)
        }

        setShowSuggestions(true)
    }

    const handleSuggestionClick = (suggestion: string) => {
        skipNextSearchRef.current = true
        onSelect?.(suggestion)
        setShowSuggestions(false)
    }

    return (
        <div className={styles.searchWrapper} ref={wrapperRef}>
            <input
                type="text"
                value={value}
                onChange={handleInputChange}
                onFocus={() => setShowSuggestions(true)}
                placeholder={placeholder}
                className={styles.searchInput}
                disabled={disabled}
            />
            {showSuggestions && suggestions.length > 0 && (
                <ul className={styles.suggestionsList}>
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            className={styles.suggestionItem}
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
            {showSuggestions && isLoading && <div className={styles.loading}>Loading...</div>}
        </div>
    )
}

export default SearchField
