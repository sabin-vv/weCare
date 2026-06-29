export interface TimePickerProps {
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
    label?: string
    error?: string
    step?: number
    minTime?: string
    maxTime?: string
}
