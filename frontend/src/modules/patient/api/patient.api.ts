import type {
    Appointment,
    CreateAppointmentRequest,
    DoctorSlotsResponse,
    GetDoctorsParams,
    Specialist,
    VerifyPaymentRequest,
} from '../types/patient.types'

import { api } from '@/services/api'

export type GetDoctorsResponse = {
    data: Specialist[]
    specialties: string[]
    total: number
}

export const getDoctors = async (params: GetDoctorsParams): Promise<GetDoctorsResponse> => {
    const searchParams = new URLSearchParams()
    if (params.search) searchParams.append('search', params.search)
    if (params.specialty) searchParams.append('specialty', params.specialty)
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())

    const response = await api.get<GetDoctorsResponse>(`/doctors?${searchParams.toString()}`)
    return response.data
}

export const getDoctorSlots = async (doctorId: string, date: string): Promise<DoctorSlotsResponse> => {
    const response = await api.get<{ data: DoctorSlotsResponse }>(`/doctors/${doctorId}/slots`, {
        params: { date },
    })
    return response.data.data
}

export const createAppointment = async (data: CreateAppointmentRequest): Promise<any> => {
    const response = await api.post<{ data: any }>('/appointments', data)
    return response.data.data
}

export const verifyPayment = async (data: VerifyPaymentRequest): Promise<any> => {
    const response = await api.post<{ data: any }>('/appointments/verify', data)
    return response.data.data
}

export const getPatientAppointments = async (): Promise<Appointment[]> => {
    const response = await api.get<{ data: Appointment[] }>('/appointments/patient')
    return response.data.data
}
