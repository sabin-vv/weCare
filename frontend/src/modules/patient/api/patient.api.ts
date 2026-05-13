import type {
    Appointment,
    AppointmentCheckoutResponse,
    CreateAppointmentRequest,
    GetWalletResponse,
    DoctorSlotsResponse,
    GetDoctorsParams,
    PatientProfileData,
    PatientProfileResponse,
    Specialist,
    UpdatePatientProfileData,
    VerifyPaymentRequest,
    RetryPaymentResponse,
} from '../types/patient.types'

import type { ApiInterface } from '@/modules/auth/api/auth.api.types'
import { api } from '@/services/api'
import { APPOINTMENT_API, DOCTORS_API, PATIENTS_API, PAYMENTS_API, WALLET_API } from '@/shared/constants/api.constants'

export type GetDoctorsResponse = {
    data: Specialist[]
    specialties: string[]
    totalPages: number
    totalCount: number
    currentPage: number
}

export const getDoctors = async (params: GetDoctorsParams): Promise<GetDoctorsResponse> => {
    const searchParams = new URLSearchParams()
    if (params.search) searchParams.append('search', params.search)
    if (params.specialty) searchParams.append('specialty', params.specialty)
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())

    const response = await api.get<GetDoctorsResponse>(`${DOCTORS_API}?${searchParams.toString()}`)
    return response.data
}

export const getPatientProfile = async (): Promise<PatientProfileData> => {
    const response = await api.get<PatientProfileResponse>(`${PATIENTS_API}/me`)
    return response.data.data
}

export const updatePatientProfile = async (data: UpdatePatientProfileData): Promise<PatientProfileData> => {
    const response = await api.put<PatientProfileResponse>(`${PATIENTS_API}/me`, data)
    return response.data.data
}

export const getDoctorSlots = async (doctorId: string, date: string): Promise<DoctorSlotsResponse> => {
    const response = await api.get<{ data: DoctorSlotsResponse }>(`${DOCTORS_API}/${doctorId}/slots`, {
        params: { date },
    })
    return response.data.data
}

export const createAppointment = async (data: CreateAppointmentRequest): Promise<AppointmentCheckoutResponse> => {
    const response = await api.post<{ data: AppointmentCheckoutResponse }>(`${APPOINTMENT_API}`, data)
    return response.data.data
}

export const verifyPayment = async (data: VerifyPaymentRequest): Promise<Appointment> => {
    const response = await api.post<{ data: Appointment }>(`${PAYMENTS_API}/verify`, data)
    return response.data.data
}

export const getPatientAppointments = async (): Promise<Appointment[]> => {
    const response = await api.get<{ data: Appointment[] }>(`${APPOINTMENT_API}/patient`)
    return response.data.data
}

export const getWallet = async (): Promise<GetWalletResponse> => {
    const response = await api.get(`${WALLET_API}`)
    return response.data
}

export const cancelAppointment = async (id: string, reason: string): Promise<ApiInterface> => {
    const response = await api.patch(`${APPOINTMENT_API}/${id}/cancel`, { reason })
    return response.data
}

export const retryPayment = async (id: string, paymentMethod: 'razorpay' | 'wallet'): Promise<RetryPaymentResponse> => {
    const response = await api.post<{ data: RetryPaymentResponse }>(`${APPOINTMENT_API}/${id}/retry-payment`, {
        paymentMethod,
    })
    return response.data.data
}
