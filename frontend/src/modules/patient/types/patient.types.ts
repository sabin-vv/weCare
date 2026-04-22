export interface Specialist {
    id: string
    name: string
    specialty: string
    accent: string
    initials: string
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
}

export interface VerifyPaymentRequest {
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
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    paymentStatus: 'pending' | 'paid' | 'failed'
    amount: number
}

export interface RazorpayOrderResponse {
    id: string
    amount: number
    currency: string
}
