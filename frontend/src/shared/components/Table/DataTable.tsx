import { memo } from 'react'
import type { ReactNode } from 'react'

import styles from './DataTable.module.css'
import type { TableProps } from './dataTable.types'

const DataTable = <T,>({ data, columns, keyExtractor, isLoading, children }: TableProps<T>) => {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={String(col.key)} className={styles.th}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={columns.length} className={styles.emptyCell}>
                                <div className={styles.loaderContainer}>
                                    <div className={styles.spinner}></div>
                                    <span>Loading...</span>
                                </div>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className={styles.emptyCell}>
                                No data available
                            </td>
                        </tr>
                    ) : (
                        data.map((item, rowIndex) => (
                            <tr
                                key={
                                    keyExtractor
                                        ? keyExtractor(item)
                                        : ((item as any).id ?? (item as any)._id ?? rowIndex)
                                }
                                className={styles.tr}
                            >
                                {columns.map((col) => (
                                    <td key={String(col.key)} className={styles.td}>
                                        {col.render ? col.render(item) : (item[col.key] as ReactNode)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            {children && <div className={styles.tableFooter}>{children}</div>}
        </div>
    )
}

export default memo(DataTable) as typeof DataTable
