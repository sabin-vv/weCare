export interface DateTimeValue {
    date: string
    time: string
}

export interface DateTimePickerProps {
    value?: DateTimeValue
    onChange?: (value: DateTimeValue) => void
    placeholder?: string
    label?: string
    error?: string
    minDate?: Date
    maxDate?: Date
}
