import type {
    DoctorAvailability,
    DoctorAvailabilityResponse,
    DoctorProfile,
    DoctorProfileResponse,
    DoctorAvailabilityUpdateResponse,
    DoctorAvailabilityUpdateResult,
    UpdateDoctorProfileData,
    ListPatientsResponse,
    PatientDetails,
    PatientDetailsResponse,
    UpdatePatientConditionPayload,
    AddPrescriptionPayload,
    AddVitalPlanPayload,
    PatientPrescription,
} from '../types/doctor.types'

import type { ApiInterface } from '@/modules/auth/api/auth.api.types'
import { api } from '@/services/api'
import { DOCTORS_API, PATIENTS_API, PRESCRIPTIONS_API, VITALS_API } from '@/shared/constants/api.constants'

export const updateProfile = async (data: FormData, hasExistingProfile = false): Promise<ApiInterface> => {
    const res = hasExistingProfile
        ? await api.put(`${DOCTORS_API}/me`, data)
        : await api.post(`${DOCTORS_API}/profile`, data)

    return res.data
}

export const getDoctorProfile = async (): Promise<DoctorProfile> => {
    const res = await api.get<DoctorProfileResponse>(`${DOCTORS_API}/me`)

    return res.data.data
}

export const updateDoctorProfile = async (data: UpdateDoctorProfileData): Promise<DoctorProfile> => {
    const res = await api.put<DoctorProfileResponse>(`${DOCTORS_API}/me`, data)

    return res.data.data
}

const unwrapDoctorAvailability = (payload: DoctorAvailability | DoctorAvailabilityResponse) => {
    return 'data' in payload ? payload.data : payload
}

export const getDoctorAvailability = async (): Promise<DoctorAvailability> => {
    const res = await api.get<DoctorAvailability | DoctorAvailabilityResponse>(`${DOCTORS_API}/availability`)
    return unwrapDoctorAvailability(res.data)
}

export const updateDoctorAvailability = async (data: DoctorAvailability): Promise<DoctorAvailabilityUpdateResult> => {
    const res = await api.put<DoctorAvailabilityUpdateResponse>(`${DOCTORS_API}/availability`, data)
    return res.data.data
}

export const listPatients = async (
    search: string,
    filter: string,
    page: number,
    limit: number,
): Promise<ListPatientsResponse> => {
    const res = await api.get(`${PATIENTS_API}/`, {
        params: {
            search,
            filter,
            page,
            limit,
        },
    })

    return res.data.data
}

export const getPatientById = async (patientId: string): Promise<PatientDetails> => {
    const res = await api.get<PatientDetailsResponse>(`${PATIENTS_API}/${patientId}`)

    return res.data.data
}

export const startConsultation = async (patientId: string): Promise<ApiInterface> => {
    const res = await api.put(`${DOCTORS_API}${PATIENTS_API}/${patientId}/start-consultation`)

    return res.data
}

export const completeConsultation = async (patientId: string): Promise<ApiInterface> => {
    const res = await api.put(`${DOCTORS_API}${PATIENTS_API}/${patientId}/complete-consultation`)

    return res.data
}

export const updatePatientCondition = async (
    patientId: string,
    data: UpdatePatientConditionPayload,
): Promise<PatientDetails> => {
    const res = await api.patch<PatientDetailsResponse>(`${PATIENTS_API}/${patientId}/condition`, data)

    return res.data.data
}

export const addPrescription = async (
    patientId: string,
    data: AddPrescriptionPayload,
): Promise<PatientPrescription> => {
    const res = await api.post(`${PRESCRIPTIONS_API}`, {
        ...data,
        patientId,
    })

    return res.data.data
}

export const updatePrescriptionStatus = async (prescriptionId: string, status: string): Promise<void> => {
    await api.patch(`${PRESCRIPTIONS_API}/${prescriptionId}/status`, { status })
}

export const createVitalPlan = async (patientId: string, data: AddVitalPlanPayload): Promise<void> => {
    await api.post(`${VITALS_API}/plans`, {
        ...data,
        patientId,
    })
}
