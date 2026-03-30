import { PatientDocument } from '../types/patient.types'
import { RegisterPatientDTO } from '../validator/patient.schema'

export interface IPatientService {
    registerPatient(dto: RegisterPatientDTO): Promise<PatientDocument>
}
