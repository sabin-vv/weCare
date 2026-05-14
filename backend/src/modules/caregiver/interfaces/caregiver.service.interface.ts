import { Types } from 'mongoose'

import { CaregiverProfileResponse } from '../types/caregiver.types'
import { MedicationScheduleDTO } from '../../medication/types/medication.type'
import { VitalPlanItem } from '../../vital/types/vital.types'
import { PatientSummary } from '../interfaces/caregiver.repository.interface'
import { CreateCaregiverProfileDTO } from '../validator/caregiver.schema'
import { UpdateCaregiverSettingsDTO } from '../validator/updateCaregiverSettings.schema'

export interface ICaregiverService {
    createProfile(userId: string, dto: CreateCaregiverProfileDTO): Promise<Partial<CaregiverProfileResponse>>
    getProfile(userId: string): Promise<CaregiverProfileResponse>
    updateProfile(userId: string, dto: UpdateCaregiverSettingsDTO): Promise<CaregiverProfileResponse>
    listCaregivers(search?: string): Promise<CaregiverProfileResponse[]>
    getPatientMedications(caregiverId: Types.ObjectId, patientId: string): Promise<MedicationScheduleDTO[]>
    getPatientVitalPlans(caregiverId: Types.ObjectId, patientId: string): Promise<VitalPlanItem[]>
    getMyPatients(caregiverId: Types.ObjectId): Promise<PatientSummary[]>
}
