import type {
    AlertData,
    CaregiverProfileResponse,
    CreateReminderDTO,
    CaregiverActivityLogResponse,
    MedicationSchedule,
    PaginationData,
    PatientSummary,
    PrescriptionItem,
    RemindersResponse,
    VitalPlanItem,
    VitalScheduleItem,
} from '../types/caregiver.types'

import type { ApiInterface } from '@/modules/auth/api/auth.api.types'
import { api } from '@/services/api'
import { CAREGIVER_ACTIVITY_API, CAREGIVERS_API, PRESCRIPTIONS_API, REMINDERS_API } from '@/shared/constants/api.constants'

export type { PatientSummary, PrescriptionItem, VitalPlanItem } from '../types/caregiver.types'

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

export const getPatientMedications = async (patientId: string): Promise<MedicationSchedule[]> => {
    const res = await api.get<{ success: boolean; data: MedicationSchedule[]; message: string }>(
        `${CAREGIVERS_API}/patients/${patientId}/medications`,
    )
    return res.data.data
}

export const getPatientVitalSchedules = async (patientId: string): Promise<VitalScheduleItem[]> => {
    const res = await api.get<{ success: boolean; data: VitalScheduleItem[]; message: string }>(
        `${CAREGIVERS_API}/patients/${patientId}/vital-schedules`,
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
        scheduleId?: string
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

export const getReminders = async (): Promise<RemindersResponse> => {
    const res = await api.get<{ success: boolean; data: RemindersResponse; message: string }>(REMINDERS_API)
    return res.data.data
}

export const createReminder = async (dto: CreateReminderDTO): Promise<void> => {
    await api.post(REMINDERS_API, dto)
}

export const markReminderDone = async (reminderId: string): Promise<void> => {
    await api.patch(`${REMINDERS_API}/${reminderId}/done`)
}

export const deleteReminder = async (reminderId: string): Promise<void> => {
    await api.delete(`${REMINDERS_API}/${reminderId}`)
}

export const getCaregiverActivityLogs = async (page = 1, limit = 8): Promise<CaregiverActivityLogResponse> => {
    const res = await api.get<{ success: boolean; data: CaregiverActivityLogResponse }>(CAREGIVER_ACTIVITY_API, {
        params: { page, limit },
    })
    return res.data.data
}

export const getPatientPrescriptions = async (patientId: string): Promise<PrescriptionItem[]> => {
    const res = await api.get<{ success: boolean; data: PrescriptionItem[] }>(
        `${PRESCRIPTIONS_API}/patient/${patientId}`,
    )
    return res.data.data
}

export const getPatientVitalPlans = async (patientId: string): Promise<VitalPlanItem[]> => {
    const res = await api.get<{ success: boolean; data: VitalPlanItem[] }>(
        `${CAREGIVERS_API}/patients/${patientId}/vital-plans`,
    )
    return res.data.data
}

export const getCaregiverAlerts = async (
    filters?: { type?: string; severity?: string; status?: string; limit?: number; page?: number },
): Promise<{ alerts: AlertData[]; pagination: PaginationData }> => {
    const res = await api.get<{ success: boolean; data: { alerts: AlertData[]; pagination: PaginationData } }>(
        `${CAREGIVERS_API}/alerts`,
        { params: filters },
    )
    return res.data.data
}

export const acknowledgeAlert = async (alertId: string, note?: string): Promise<AlertData> => {
    const res = await api.patch<{ success: boolean; data: AlertData; message: string }>(
        `${ALERTS_API}/${alertId}/acknowledge`,
        { note },
    )
    return res.data.data
}
