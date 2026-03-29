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
export interface User {
    id: string
    name: string
    email: string
    profileImage?: string
}
export interface AuthContextType {
    user: User | null
    setAuth: (user: User) => void
    clearAuth: () => void
    isAuthenticated: boolean
}

export interface OtpVerificationProps {
    email: string
    onVerify: (otp: string) => Promise<void>
    onResend: () => Promise<void>
    onBack?: () => void
    loading?: boolean
}
export interface RegisterFormData {
    name: string
    email: string
    mobile: string
    password: string
    confirmPassword: string
}

export type BasicInfoFormProps = {
    defaultValues?: RegisterFormData
    onSubmit: (data: RegisterFormData) => void
    loading?: boolean
    role?: 'doctor' | 'caregiver'
    title: string
    description?: string
}
