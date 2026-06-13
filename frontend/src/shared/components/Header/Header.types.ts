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
    trailing?: ReactNode
}

export interface navLinkRight {
    settings: string
}

export interface RoleRoute {
    doctor: navLinkRight
    caregiver: navLinkRight
    patient: navLinkRight
    admin: navLinkRight
}
