import type { ReactNode } from 'react'

export interface UserProfile {
    _id: string
    name: string
    email: string
    role: 'doctor' | 'caregiver' | 'patient'
    isActive: boolean
    createdAt: string
    profileImage?: string
}

export interface PageCardProps {
    title?: string
    subtitle?: string
    actions?: ReactNode
    children: ReactNode
}

export interface StatCardProps {
    title: string
    value: string | number
    icon?: string
}
