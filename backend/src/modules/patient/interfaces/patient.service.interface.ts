import { PatientResponseDTO } from '../types/patient.types'
import {
    CareTeamResponseDTO,
    ClinicalStatus,
    ListPatientsResponse,
    PatientDetailsDTO,
    PatientProfileResponseDTO,
} from '../types/patient.types'
import { RegisterPatientDTO } from '../validator/patient.schema'
import { UpdatePatientConditionDTO } from '../validator/updatePatientCondition.schema'
import { UpdatePatientSettingsDTO } from '../validator/updatePatientSettings.schema'

export interface IPatientService {
    registerPatient(dto: RegisterPatientDTO): Promise<PatientResponseDTO>
    getProfile(userId: string): Promise<PatientProfileResponseDTO>
    updateProfile(userId: string, dto: UpdatePatientSettingsDTO): Promise<PatientProfileResponseDTO>
    getCareTeam(userId: string): Promise<CareTeamResponseDTO>

    listPatients(
        doctorId: string,
        params: {
            search: string
            clinicalStatus: string
            riskLevel: string
            page: number
            limit: number
        },
    ): Promise<ListPatientsResponse>

    getPatientById(doctorId: string, patientId: string): Promise<PatientDetailsDTO>
    updatePatientCondition(
        doctorId: string,
        patientId: string,
        dto: UpdatePatientConditionDTO,
    ): Promise<PatientDetailsDTO>
    assignCaregiver(doctorId: string, patientId: string, caregiverId: string): Promise<PatientDetailsDTO>
    updateClinicalStatus(
        doctorId: string,
        patientId: string,
        clinicalStatus: ClinicalStatus,
    ): Promise<PatientDetailsDTO>
}
