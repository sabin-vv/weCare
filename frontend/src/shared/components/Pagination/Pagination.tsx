import styles from './Pagination.module.css'

import { ChevronLeft } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import type { PaginationProps } from './Pagination.types'

const Pagination = ({ currentPage, totalPages, onPageChange, totalCount, limit }: PaginationProps) => {
    const limitNum = Number(limit) || 0
    const pageNum = Number(currentPage) || 1
    const totalNum = Number(totalCount) || 0

    const getVisiblePages = () => {
        const delta = 2
        const range: number[] = []
        const rangeWithDots: (number | string)[] = []
        let l: number | undefined

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= pageNum - delta && i <= pageNum + delta)) {
                range.push(i)
            }
        }

        for (const i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1)
                } else if (i - l !== 1) {
                    rangeWithDots.push('...')
                }
            }
            rangeWithDots.push(i)
            l = i
        }

        return rangeWithDots
    }

    const startIdx = totalNum === 0 ? 0 : (pageNum - 1) * limitNum + 1
    const endIdx = Math.min(pageNum * limitNum, totalNum)

    return (
        <div className={styles.pagination}>
            <div className={styles.info}>
                Showing <span className={styles.highlight}>{startIdx}</span> -{' '}
                <span className={styles.highlight}>{endIdx}</span> of{' '}
                <span className={styles.highlight}>{totalCount}</span> total
            </div>

            <div className={styles.controls}>
                <button
                    className={styles.arrow}
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    title="Previous Page"
                >
                    <ChevronLeft size={18} />
                </button>

                {getVisiblePages().map((page, index) =>
                    page === '...' ? (
                        <span key={`dots-${index}`} className={styles.dots}>
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            className={`${styles.page} ${currentPage === page ? styles.active : ''}`}
                            onClick={() => onPageChange(page as number)}
                        >
                            {page}
                        </button>
                    )
                )}

                <button
                    className={styles.arrow}
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    title="Next Page"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    )
}

export default Pagination
