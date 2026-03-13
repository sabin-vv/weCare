import type React from 'react'

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    errors?: string
    icon?: React.ReactNode
    prefix?: string
}
