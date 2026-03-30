import type { InputHTMLAttributes, ReactNode } from 'react'

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    errors?: string
    icon?: ReactNode
    prefix?: string
}
