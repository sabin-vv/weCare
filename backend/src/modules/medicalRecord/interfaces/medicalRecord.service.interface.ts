import { MedicalRecordDTO } from '../types/medicalRecord.types'

export interface IMedicalRecordService {
    getMedicalRecord(doctorId: string, patientId: string): Promise<MedicalRecordDTO>
    updateMedicalRecord(
        doctorId: string,
        patientId: string,
        data: { allergies?: string[]; pastSurgeries?: string },
    ): Promise<MedicalRecordDTO>
    addClinicalNote(doctorId: string, patientId: string, note: string): Promise<MedicalRecordDTO>
}
