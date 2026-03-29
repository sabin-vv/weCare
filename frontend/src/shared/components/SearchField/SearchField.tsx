import { useEffect, useState } from 'react'

import styles from './SearchField.module.css'
import type { SearchFieldProps } from './SearchField.types'

const SearchField = ({ placeholder, onSearch, delay = 500 }: SearchFieldProps) => {
    const [query, setQuery] = useState<string>('')

    useEffect(() => {
        const handler = setTimeout(() => {
            onSearch(query)
        }, delay)

        return () => clearTimeout(handler)
    }, [query, delay, onSearch])
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
