export interface Specialist {
    id: string
    name: string
    specialty: string
    accent: string
    initials: string
    profileImage?: string
}

export interface PatientProfileData {
    id: string
    name: string
    email: string
    mobile: string
    patientId: string
    dateOfBirth: string
    gender: string
    conditions: string[]
    profileImage?: string
    isActive: boolean
}

export interface PatientProfileResponse {
    success: boolean
    message: string
    data: PatientProfileData
}

export interface UpdatePatientProfileData {
    name?: string
    email?: string
    mobile?: string
    profileImage?: string
}

export interface GetDoctorsParams {
    search?: string
    specialty?: string
    page?: number
    limit?: number
}

export interface DoctorSlot {
    start: string
    end: string
    available: boolean
}

export interface DoctorSlotsResponse {
    doctorId: string
    date: string
    slots: DoctorSlot[]
}

export interface CreateAppointmentRequest {
    doctorId: string
    appointmentDate: Date | string
    slotStart: string
    slotEnd: string
}

export interface VerifyPaymentRequest {
    paymentId: string
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
}

export interface Appointment {
    _id: string
    doctorId: {
        _id: string
        name: string
        email: string
    }
    appointmentDate: string
    slotStart: string
    slotEnd: string
    status: 'pending_payment' | 'confirmed' | 'cancelled' | 'in_consultation' | 'completed'
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
    amount: number
}

export interface RazorpayOrder {
    id: string
    amount: number
    currency: string
}

export interface CreateAppointmentResponse {
    order: RazorpayOrder
    paymentId: string
}
export interface RazorpayOrderResponse {
    id: string
    amount: number | string
    currency: string
    receipt?: string
    status?: string
}

export interface DoctorInfo {
    id: string
    name: string
    professionalTitle: string
    profileImage?: string

    consultationFee: number
}

export interface RazorpayResponse {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
}
