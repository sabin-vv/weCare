import type {
    DoctorAvailability,
    DoctorAvailabilityResponse,
    DoctorProfile,
    DoctorProfileResponse,
    DoctorAvailabilityUpdateResponse,
    DoctorAvailabilityUpdateResult,
    UpdateDoctorProfileData,
    ListPatientsResponse,
} from '../types/doctor.types'

import type { ApiInterface } from '@/modules/auth/api/auth.api.types'
import { api } from '@/services/api'

export const updateProfile = async (data: FormData, hasExistingProfile = false): Promise<ApiInterface> => {
    const res = hasExistingProfile ? await api.put('/doctors/me', data) : await api.post('/doctors/profile', data)

    return res.data
}

export const getDoctorProfile = async (): Promise<DoctorProfile> => {
    const res = await api.get<DoctorProfileResponse>('/doctors/me')

    return res.data.data
}

export const updateDoctorProfile = async (data: UpdateDoctorProfileData): Promise<DoctorProfile> => {
    const res = await api.put<DoctorProfileResponse>('/doctors/me', data)

    return res.data.data
}

const unwrapDoctorAvailability = (payload: DoctorAvailability | DoctorAvailabilityResponse) => {
    return 'data' in payload ? payload.data : payload
}

export const getDoctorAvailability = async (): Promise<DoctorAvailability> => {
    const res = await api.get<DoctorAvailability | DoctorAvailabilityResponse>('/doctors/availability')
    return unwrapDoctorAvailability(res.data)
}

export const updateDoctorAvailability = async (data: DoctorAvailability): Promise<DoctorAvailabilityUpdateResult> => {
    const res = await api.put<DoctorAvailabilityUpdateResponse>('/doctors/availability', data)
    return res.data.data
}

export const listPatients = async (
    search: string,
    filter: string,
    page: number,
    limit: number,
): Promise<ListPatientsResponse> => {
    const res = await api.get('/patients/', {
        params: {
            search,
            filter,
            page,
            limit,
        },
    })

    return res.data.data
}
