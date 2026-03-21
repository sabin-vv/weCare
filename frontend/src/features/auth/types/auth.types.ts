import type { ReactNode } from 'react'
import type React from 'react'

export enum Role {
    DOCTOR = 'doctor',
    CAREGIVER = 'caregiver',
    PATIENT = 'patient',
}

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
export enum OtpPurpose {
    EMAIL_VERIFICATION = 'email-verification',
    PASSWORD_RESET = 'password-reset',
    ACCOUNT_RECOVERY = 'account-recovery',
}
export interface EmailVerifyProps {
    email: string
    purpose: OtpPurpose
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
    onChange: (role: Role) => void
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
export interface caregiverStepOneProps extends Omit<StepOneProps, 'setFormData'> {
    setFormData: React.Dispatch<React.SetStateAction<caregiverRegisterState>>
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

export interface caregiverDocuments extends Pick<DoctorDocuments, 'govId' | 'profileImage'> {
    certificate: Certificate
    licence: Certificate
}

export interface caregiverRegisterState {
    basicInfo: RegisterFormData
    documents: caregiverDocuments
}
export interface caregiverStepThreeProps {
    nextStep: () => void
    prevStep: () => void
    documents: caregiverDocuments
    registerData: caregiverRegisterState
    setRegisterData: React.Dispatch<React.SetStateAction<caregiverRegisterState>>
}

export const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
]

export interface PatientRegisterData {
    name: string
    email: string
    dateOfBirth: string
    gender: 'male' | 'female' | 'other'
    mobile: string
    password: string
    confirmPassword: string
}
export interface LoginFormData {
    email: string
    password: string
}
