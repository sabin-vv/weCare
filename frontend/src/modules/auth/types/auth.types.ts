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

export interface FileUploadBoxProps {
    file?: File | null
    accept?: string
    onFileSelect: (file: File) => void
}
export interface FormNavigationButtonsProps {
    onBack?: () => void
    onNext: () => void
    nextLabel?: string
    backLabel?: string
    isNextDisabled?: boolean
    isLoading?: boolean
}
