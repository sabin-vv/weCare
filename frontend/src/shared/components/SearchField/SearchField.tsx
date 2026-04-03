import { useEffect, useRef, useState } from 'react'

import styles from './SearchField.module.css'
import type { SearchFieldProps } from './SearchField.types'

const SearchField = ({ placeholder, onSearch, delay = 500 }: SearchFieldProps) => {
    const [query, setQuery] = useState<string>('')
    const isFirstMount = useRef(true)

    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false
            return
        }

        if (query === '') {
            onSearch('')
            return
        }

        const handler = setTimeout(() => {
            onSearch(query)
        }, delay)

        return () => clearTimeout(handler)
    }, [query, delay])

    return (
        <div className={styles.searchWrapper}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className={styles.searchInput}
            />
        </div>
    )
}

export default SearchField
