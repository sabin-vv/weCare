import type { ReactNode } from 'react'
import type React from 'react'

export type Role = 'doctor' | 'caregiver' | 'patient'

export type User = {
    name: string
    email: string
    role: Role
}

export interface FormWrapperProps {
    title: string
    description?: string
    children?: React.ReactNode
    maxWidth?: string
}
export interface EmailVerifyProps {
    email: string
    prevStep: () => void
    nextStep: () => void
}

export interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    error?: string
    onForgotPassword?: () => void
}
export interface ProfessionalButtonsProps {
    onBack: () => void
    onNext: () => void
    backLabel?: string
    nextLabel?: string
}

export interface ProgressBarProps {
    step: number
    totalSteps: number
    percentage: number
    title: string
}

export interface RoleSelectorProps {
    role: Role
    onChange: (role: 'doctor' | 'caregiver' | 'patient') => void
}
export interface VerificationCardProps {
    children: ReactNode
    title: string
    description: string
}

export interface RegisterFormData {
    name: string
    email: string
    mobile: string
    password: string
    confirmPassword: string
}

export interface StepOneProps {
    nextStep: () => void
    formData: RegisterFormData
    setFormData: React.Dispatch<React.SetStateAction<DoctorRegisterState>>
}
export interface StepThreeProps {
    prevStep: () => void
    nextStep: () => void
    documents: DoctorDocuments
    specializations: Specialization[]
    registerData: DoctorRegisterState
    setRegisterData: React.Dispatch<React.SetStateAction<DoctorRegisterState>>
}

export interface Specialization {
    name: string
    document: File | null
}

export interface Certificate {
    number: string
    document: File | null
}
export interface DoctorDocuments {
    govId: File | null
    profileImage: File | null
    medicalCertificate: Certificate
    councilRegistration: Certificate
}
export interface DoctorStepThreeData {
    specializations: Specialization[]
    documents: DoctorDocuments
}
export interface DoctorRegisterState {
    basicInfo: RegisterFormData
    documents: DoctorDocuments
    specializations: Specialization[]
}
