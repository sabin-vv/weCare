import { MedicalRecordDocument, IClinicalNote } from '../types/medicalRecord.types'

export interface IMedicalRecordRepository {
    findByPatientId(patientId: string): Promise<MedicalRecordDocument | null>
    upsert(patientId: string, data: Partial<MedicalRecordDocument>): Promise<MedicalRecordDocument>
    addClinicalNote(patientId: string, note: IClinicalNote): Promise<MedicalRecordDocument | null>
}
