import { VitalLogDocument } from '../types/vitalLog.types'
import { CreateVitalLogDTO } from '../validator/vitalLog.schema'

export interface IVitalLogService {
    create(userId: string, data: CreateVitalLogDTO): Promise<VitalLogDocument>
    getPatientLogs(patientId: string): Promise<VitalLogDocument[]>
}
