import type { ReactNode } from 'react'

export interface Column<T> {
    header: string
    key: keyof T
    render?: (item: T) => ReactNode
}

export interface TableProps<T> {
    data: T[]
    columns: Column<T>[]
    keyExtractor?: (item: T) => string | number
    isLoading?: boolean
    children?: ReactNode
}
