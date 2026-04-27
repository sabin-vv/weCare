import type { ReactNode } from 'react'

export interface CardProps {
    title: string
    description?: string
    children: ReactNode
    required?: boolean
}
