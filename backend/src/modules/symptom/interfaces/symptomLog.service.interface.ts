import { SymptomLogDocument } from '../types/symptomLog.types'
import { CreateSymptomLogDTO } from '../validator/symptomLog.schema'

export interface ISymptomLogService {
    create(userId: string, data: CreateSymptomLogDTO): Promise<SymptomLogDocument>
    getPatientLogs(patientId: string): Promise<SymptomLogDocument[]>
}
