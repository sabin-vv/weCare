export interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    totalCount: number
    limit: number
}
