export interface UserProfile {
    _id: string
    name: string
    email: string
    role: 'doctor' | 'caregiver' | 'patient'
    isActive: boolean
    createdAt: string
    profileImage?: string
}
