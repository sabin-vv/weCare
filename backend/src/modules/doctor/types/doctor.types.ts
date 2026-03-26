export interface DoctorSpecialization {
    name: string
    documentImage: string
}

export interface DoctorEntity {
    userId: string
    medicalCertificateNumber: string
    medicalCouncilRegisterNumber: string

    specializations: DoctorSpecialization[]

    govIdImage: string
    profileImage: string
    medicalCertificateImage: string
    medicalCouncilImage: string
}
