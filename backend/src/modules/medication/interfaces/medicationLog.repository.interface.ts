import { MedicationLogDocument, MedicationLogInput } from '../types/medicationLog.types'

export interface IMedicationLogRepository {
    create(data: MedicationLogInput): Promise<MedicationLogDocument>
    findByPatientId(patientId: string): Promise<MedicationLogDocument[]>
    findById(id: string): Promise<MedicationLogDocument | null>
}