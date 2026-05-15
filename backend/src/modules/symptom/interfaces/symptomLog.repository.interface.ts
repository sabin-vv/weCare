import { SymptomLogDocument, SymptomLogInput } from '../types/symptomLog.types'

export interface ISymptomLogRepository {
    create(data: SymptomLogInput): Promise<SymptomLogDocument>
    findByPatientId(patientId: string): Promise<SymptomLogDocument[]>
    findById(id: string): Promise<SymptomLogDocument | null>
}
