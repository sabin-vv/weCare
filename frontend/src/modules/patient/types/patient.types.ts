import type { ApiInterface } from '@/modules/auth/api/auth.api.types'

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
    paymentMethod: 'razorpay' | 'wallet'
    slotStart: string
    slotEnd: string
}

export interface VerifyPaymentRequest {
    paymentId: string
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
}

interface Specialization {
    name: string
    verified: boolean
    documentImage: string
}

export interface Appointment {
    _id: string
    doctorId: {
        _id: string
        userId: {
            name: string
            email: string
        }
        specializations: Specialization[]
    }
    appointmentDate: string
    slotStart: string
    slotEnd: string
    status: 'pending_payment' | 'confirmed' | 'cancelled' | 'in_consultation' | 'completed'
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refund_pending' | 'refunded'
    amount: number
}

export interface RazorpayOrder {
    id: string
    amount: number
    currency: string
}

export interface CreateAppointmentResponse {
    paymentMethod: 'razorpay'
    order: RazorpayOrder
    paymentId: string
}

export interface WalletAppointmentResponse {
    paymentMethod: 'wallet'
    paymentId: string
    appointmentId: string
    walletBalance: number
    appointmentConfirmed: true
}

export type AppointmentCheckoutResponse = CreateAppointmentResponse | WalletAppointmentResponse
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

export interface Transactions {
    type: 'credit' | 'debit'
    amount: number
    description: string
    createdAt: Date
}
export interface GetWallet {
    balance: number
    transactions: Transactions[]
}

export interface GetWalletResponse extends ApiInterface {
    data: GetWallet
}

export interface CancelModalContentProps {
    cancellationReason: string
    setCancellationReason: (reason: string) => void
    customReason: string
    setCustomReason: (reason: string) => void
}

export interface PaymentMethodModalProps {
    isOpen: boolean
    onClose: () => void
    amount: number
    onSelectRazorpay: () => void
    onSelectWallet: () => void
    walletBalance?: number
}

export type RetryPaymentResponse =
    | {
          paymentMethod: 'razorpay'
          order: { id: string; amount: number; currency: string }
          paymentId: string
      }
    | {
          paymentMethod: 'wallet'
          paymentId: string
          appointmentId: string
          walletBalance: number
          appointmentConfirmed: true
      }
