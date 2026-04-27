export interface SearchFieldProps {
    value: string
    placeholder?: string
    onSearch: (value: string) => void
    delay?: number
}
