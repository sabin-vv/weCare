export interface ProgressBarProps {
    step: number
    totalSteps: number
    percentage: number
    title: string
}

export enum Role {
    DOCTOR = 'doctor',
    CAREGIVER = 'caregiver',
    PATIENT = 'patient',
    ADMIN = 'admin',
}

export interface RoleSelectorProps {
    role: Role
    onChange: (role: Role) => void
}
