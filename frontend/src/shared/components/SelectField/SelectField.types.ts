import type { SelectHTMLAttributes } from 'react'

export interface Options {
    label: string
    value: string
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string
    options: Options[]
    errors?: string
}
