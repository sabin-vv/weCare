import styles from './Pagination.module.css'

import { ChevronLeft } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import type { PaginationProps } from './Pagination.types'

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    const getPages = () => {
        const pages: number[] = []
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i)
        }
        return pages
    }

    return (
        <div className={styles.pagination}>
            <button className={styles.arrow} disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
                <ChevronLeft size={18} />
            </button>

            {getPages().map((page) => (
                <button
                    key={page}
                    className={`${styles.page} ${currentPage === page ? styles.active : ''}`}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </button>
            ))}

            <button
                className={styles.arrow}
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                <ChevronRight size={18} />
            </button>
        </div>
    )
}

export default Pagination
