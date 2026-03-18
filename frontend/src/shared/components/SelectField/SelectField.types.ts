import type React from 'react'

export interface Options {
    label: string
    value: string
}

export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string
    options: Options[]
    errors?: string
}
