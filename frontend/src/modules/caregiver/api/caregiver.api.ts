import type { CaregiverProfileResponse } from '../types/caregiver.types'

import type { ApiInterface } from '@/modules/auth/api/auth.api.types'
import { api } from '@/services/api'
import { CAREGIVERS_API } from '@/shared/constants/api.constants'

export const createCaregiverProfile = async (formData: FormData): Promise<ApiInterface> => {
    const res = await api.post(`${CAREGIVERS_API}/profile`, formData)
    return res.data
}

export const getCaregiverProfile = async (): Promise<CaregiverProfileResponse> => {
    const res = await api.get<CaregiverProfileResponse>(`${CAREGIVERS_API}/me`)
    return res.data
}

export const updateCaregiverProfile = async (data: Record<string, unknown>): Promise<CaregiverProfileResponse> => {
    const res = await api.put<CaregiverProfileResponse>(`${CAREGIVERS_API}/me`, data)
    return res.data
}

export interface MedicationSchedule {
    _id: string
    medicineName: string
    dosage: string
    route: string
    scheduleTime: string
    priority: string
    status: string
    administeredAt?: string
    administrationNotes?: string
}

export interface VitalPlanItem {
    type: string
    frequencyValue: number
    frequencyUnit: string
    durationValue: number
    durationUnit: string
    latestReading?: {
        value?: number
        systolic?: number
        diastolic?: number
        unit?: string
        recordedAt?: string
    }
}

export interface PatientSummary {
    _id: string
    patientId: string
    userName: string
    userMobile: string
    userEmail: string
    dateOfBirth: string
    gender: string
    conditions: string[]
    riskLevel: string
    clinicalStatus: string
    profileImage?: string
}

export const getPatientMedications = async (patientId: string): Promise<MedicationSchedule[]> => {
    const res = await api.get<{ success: boolean; data: MedicationSchedule[]; message: string }>(
        `${CAREGIVERS_API}/patients/${patientId}/medications`,
    )
    return res.data.data
}

export const getPatientVitalPlans = async (patientId: string): Promise<VitalPlanItem[]> => {
    const res = await api.get<{ success: boolean; data: VitalPlanItem[]; message: string }>(
        `${CAREGIVERS_API}/patients/${patientId}/vital-plans`,
    )
    return res.data.data
}

export const getMyPatients = async (): Promise<PatientSummary[]> => {
    const res = await api.get<{ success: boolean; data: PatientSummary[]; message: string }>(
        `${CAREGIVERS_API}/patients`,
    )
    return res.data.data
}

export const logMedicationAction = async (
    patientId: string,
    scheduleId: string,
    data: {
        status: 'on_time' | 'taken_late' | 'skipped'
        takenTime: string
        route: string
        observations?: string
    },
): Promise<MedicationSchedule> => {
    const res = await api.post<{ success: boolean; data: MedicationSchedule; message: string }>(
        `${CAREGIVERS_API}/patients/${patientId}/medications/${scheduleId}/log`,
        data,
    )
    return res.data.data
}

export const logVitalReading = async (
    patientId: string,
    data: {
        vitalType: string
        systolic?: number
        diastolic?: number
        value?: number
        recordedAt: string
        notes?: string
    },
): Promise<{ vitalId: string; vitalType: string; scheduleId?: string; recordedAt: string }> => {
    const res = await api.post<{
        success: boolean
        data: { vitalId: string; vitalType: string; scheduleId?: string; recordedAt: string }
        message: string
    }>(`${CAREGIVERS_API}/patients/${patientId}/vitals/log`, data)
    return res.data.data
}

export const logSymptom = async (
    patientId: string,
    data: {
        symptom: string
        onsetTime: string
        severity: 'mild' | 'moderate' | 'severe' | 'critical'
        observations?: string
    },
): Promise<{
    _id: string
    symptom: string
    severity: 'mild' | 'moderate' | 'severe' | 'critical'
    onsetTime: string
    observations?: string
    createdAt: string
}> => {
    const res = await api.post<{
        success: boolean
        data: {
            _id: string
            symptom: string
            severity: 'mild' | 'moderate' | 'severe' | 'critical'
            onsetTime: string
            observations?: string
            createdAt: string
        }
        message: string
    }>(`${CAREGIVERS_API}/patients/${patientId}/symptoms/log`, data)
    return res.data.data
}
