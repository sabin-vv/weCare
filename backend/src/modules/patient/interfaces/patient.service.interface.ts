import { PatientResponseDTO } from '../mapper/patient.mapper'
import { ListPatientsResponse, PatientProfileResponseDTO } from '../types/patient.types'
import { RegisterPatientDTO } from '../validator/patient.schema'
import { UpdatePatientSettingsDTO } from '../validator/updatePatientSettings.schema'

export interface IPatientService {
    registerPatient(dto: RegisterPatientDTO): Promise<PatientResponseDTO>
    getProfile(userId: string): Promise<PatientProfileResponseDTO>
    updateProfile(userId: string, dto: UpdatePatientSettingsDTO): Promise<PatientProfileResponseDTO>

    listPatients(
        doctorId: string,
        params: {
            search: string
            filter: string
            page: number
            limit: number
        },
    ): Promise<ListPatientsResponse>
}
