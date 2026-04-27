import { useState } from 'react'

import styles from './Sidebar.module.css'

import SearchField from '@/shared/components/SearchField/SearchField'

const Sidebar = () => {
    const [query, setQuery] = useState<string>('')

    return (
        <aside className={styles.sidebar}>
            <h3 className={styles.title}>Patient Directory</h3>

            <SearchField placeholder="Search patients..." value={query} onSearch={setQuery} />

            <div className={styles.filters}>
                <button className={styles.active}>All</button>
                <button>Critical</button>
                <button>High Risk</button>
                <button>Hospitalized</button>
            </div>

            <div className={styles.list}></div>
        </aside>
    )
}

export default Sidebar
