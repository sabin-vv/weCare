import type { ReactNode } from 'react'

export interface NavLink {
    label: string
    path: string
}

export interface HeaderProps {
    titlePrefix?: string
    subtitle?: string
    navLinks?: NavLink[]
    children?: ReactNode
    leading?: ReactNode
}

export interface navLinkRight {
    notification: string
    settings: string
}

export interface RoleRoute {
    doctor: navLinkRight
    caregiver: navLinkRight
    patient: navLinkRight
    admin: navLinkRight
}
