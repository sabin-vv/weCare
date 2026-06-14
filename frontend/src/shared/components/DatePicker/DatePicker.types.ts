export interface DatePickerProps {
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
    minDate?: Date
    maxDate?: Date
}
