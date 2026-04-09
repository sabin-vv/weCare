export interface Certificate {
    number: string
    document: File | null
}
export interface Specializations {
    name: string
    document: File | null
}
export interface DoctorDocuments {
    govId: File | null
    profileImage: File | null
    medicalCertificate: Certificate
    councilRegistration: Certificate
}
