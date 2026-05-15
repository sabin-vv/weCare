import { MedicationLogDocument } from '../types/medicationLog.types'
import { CreateMedicationLogDTO } from '../validator/medicationLog.schema'

export interface IMedicationLogService {
    create(userId: string, dto: CreateMedicationLogDTO): Promise<MedicationLogDocument>
    getPatientLogs(patientId: string): Promise<MedicationLogDocument[]>
}
