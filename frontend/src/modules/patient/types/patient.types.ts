import type { ApiInterface } from '@/modules/auth/api/auth.api.types'

export interface Specialist {
    id: string
    name: string
    specialty: string
    accent: string
    initials: string
    profileImage?: string
    averageRating?: number
    reviewCount?: number
}

export interface PatientProfileData {
    id: string
    patientMongoId: string
    name: string
    email: string
    mobile: string
    patientId: string
    dateOfBirth: string
    gender: string
    conditions: string[]
    profileImage?: string
    caregiverId?: string
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
    sortBy?: 'rating' | 'name' | 'newest'
    sortOrder?: 'asc' | 'desc'
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

export interface RescheduleAppointmentRequest {
    appointmentDate: string
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
    appointmentId?: string
    doctorId: {
        _id: string
        profileImage?: string
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
    cancelledBy?: string
    cancellationReason?: string
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

type AppointmentStatus = 'pending_payment' | 'confirmed' | 'in_consultation' | 'cancelled' | 'completed'
export interface AppointmentCardProps {
    doctorName: string
    date: string
    time: string
    status: AppointmentStatus
}

export interface SubscriptionData {
    subscriptionId: string
    status: 'pending_payment' | 'active' | 'expired' | 'cancelled'
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
    billingCycle: 'monthly' | 'yearly'
    subscriptionFee: number
    startDate: string
    endDate: string
    caregiver: {
        id: string
        name: string
    } | null
}

export interface CareTeamMember {
    id: string
    name: string
    role: 'doctor' | 'caregiver'
    specialization?: string[]
    profileImage?: string
    isActive: boolean
    myRating?: number
    myComment?: string
    email?: string
    mobile?: string
}

export type CareTeamResponse = CareTeamMember[]

export interface CreateFeedbackDTO {
    targetId: string
    targetRole: 'doctor' | 'caregiver'
    rating: number
    comment?: string
}

export interface SubscriptionResponse {
    success: boolean
    message: string
    data: SubscriptionData | null
}

export interface PatientData {
    appointments: Appointment[]
    subscription: SubscriptionData | null
    walletBalance: number
    subscriptionFee: number
    billingCycle: 'monthly' | 'yearly'
}

export interface MedicationSchedule {
    _id: string
    medicineName: string
    dosage: string
    route: string
    scheduleTime: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    status: 'pending' | 'administered' | 'missed' | 'skipped' | 'cancelled'
    administeredAt?: string
}

export interface Prescription {
    _id: string
    prescribedBy: {
        _id: string
        userId: {
            name: string
            email: string
        }
    }
    medications: {
        name: string
        dosage: string
        route: string
        frequency: string
        priority?: string
        duration?: number
        durationUnit?: string
        instructions?: string
    }[]
    note?: string
    status: string
    prescribedAt: string
    endDate?: string
}

export interface VitalSchedule {
    _id: string
    vitalType: string
    scheduleTime: string
    endDate: string
    status: string
    recordedValue?: {
        systolic?: number
        diastolic?: number
        value?: number
        unit?: string
    }
    recordedAt?: string
}

export interface CreateSubscriptionResponse {
    success: boolean
    message: string
    data:
        | {
              subscriptionId: string
              paymentId: string
              orderId: string
              amount: number
              currency: string
              keyId: string
          }
        | {
              subscriptionId: string
              paymentId: string
              walletBalance: number
              subscriptionConfirmed: true
          }
}

export interface Profiledata {
    name: string
    role: string
    profileImage?: string
    specialization?: string[]
    status: boolean
    rating?: number
    email?: string
    mobile?: string
}

export interface FeedbackProfileCardProps {
    profile: Profiledata
    onFeedback?: () => void
}

export interface TeamMember {
    id: string
    name: string
    role: string
    profileImage?: string
    specialization?: string[]
    status: boolean
    rating?: number
    comment?: string
    email?: string
    mobile?: string
}

export interface FeedbackTarget {
    id: string
    name: string
    role: 'doctor' | 'caregiver'
    initialRating?: number
    initialComment?: string
}
