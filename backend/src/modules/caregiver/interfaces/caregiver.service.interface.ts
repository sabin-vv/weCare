import { Types } from 'mongoose'

import { MedicationScheduleDTO } from '../../medication/types/medication.type'
import { VitalPlanItem, VitalScheduleDTO } from '../../vital/types/vital.types'
import { PatientSummary } from '../interfaces/caregiver.repository.interface'
import { CaregiverProfileResponse } from '../types/caregiver.types'
import { CaregiverVitalLogResponse, SymptomLogDTO } from '../types/caregiver.types'
import { CreateCaregiverProfileDTO } from '../validator/caregiver.schema'
import { LogMedicationDTO, LogSymptomDTO, LogVitalReadingDTO } from '../validator/caregiverLogging.schema'
import { UpdateCaregiverSettingsDTO } from '../validator/updateCaregiverSettings.schema'

export interface ICaregiverService {
    createProfile(userId: string, dto: CreateCaregiverProfileDTO): Promise<Partial<CaregiverProfileResponse>>
    getProfile(userId: string): Promise<CaregiverProfileResponse>
    updateProfile(userId: string, dto: UpdateCaregiverSettingsDTO): Promise<CaregiverProfileResponse>
    listCaregivers(search?: string): Promise<CaregiverProfileResponse[]>
    getPatientMedications(caregiverId: Types.ObjectId, patientId: string): Promise<MedicationScheduleDTO[]>
    getPatientVitalPlans(caregiverId: Types.ObjectId, patientId: string): Promise<VitalPlanItem[]>
    getPatientVitalSchedules(caregiverId: Types.ObjectId, patientId: string): Promise<VitalScheduleDTO[]>
    getMyPatients(caregiverId: Types.ObjectId): Promise<PatientSummary[]>
    logMedication(
        caregiverId: Types.ObjectId,
        patientId: string,
        scheduleId: string,
        dto: LogMedicationDTO,
    ): Promise<MedicationScheduleDTO>
    logVitalReading(
        caregiverId: Types.ObjectId,
        patientId: string,
        dto: LogVitalReadingDTO,
    ): Promise<CaregiverVitalLogResponse>
    logSymptom(caregiverId: Types.ObjectId, patientId: string, dto: LogSymptomDTO): Promise<SymptomLogDTO>
}
