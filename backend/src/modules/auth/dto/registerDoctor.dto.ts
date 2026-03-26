export enum UserRole {
    DOCTOR = 'doctor',
    CAREGIVER = 'caregiver',
    PATIENT = 'patient',
    ADMIN = 'admin',
}

export interface SpecializationInput {
    name: string
}

export interface RegisterDoctorDTO {
    name: string
    email: string
    password: string

    medicalCertificateNumber: string
    medicalCouncilRegisterNumber: string

    specializations: SpecializationInput[]
}
