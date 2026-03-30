import type { Dispatch } from 'react'

export interface CaregiverDocuments {
    govId: File | null
    profileImage: File | null
    certificate: {
        number: string
        document: File | null
    }
    license: {
        number: string
        document: File | null
    }
}

export interface CaregiverRegisterState {
    basicInfo: {
        name: string
        email: string
        mobile: string
        password: string
        confirmPassword: string
    }
    documents: CaregiverDocuments
}

export interface CaregiverDetailsFormProps {
    prevStep: () => void
    nextStep: () => void
    documents: CaregiverDocuments
    registerData: CaregiverRegisterState
    setRegisterData: Dispatch<React.SetStateAction<CaregiverRegisterState>>
}
