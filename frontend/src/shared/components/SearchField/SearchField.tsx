import { useEffect, useRef } from 'react'

import styles from './SearchField.module.css'
import type { SearchFieldProps } from './SearchField.types'

const SearchField = ({ value, placeholder, onSearch, delay = 500 }: SearchFieldProps) => {
    const isFirstMount = useRef(true)

    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false
            return
        }

        const handler = setTimeout(() => {
            onSearch(value)
        }, delay)

        return () => clearTimeout(handler)
    }, [value, delay])

    return (
        <div className={styles.searchWrapper}>
            <input
                type="text"
                value={value}
                onChange={(e) => onSearch(e.target.value)}
                placeholder={placeholder}
                className={styles.searchInput}
            />
        </div>
    )
}

export default SearchField
