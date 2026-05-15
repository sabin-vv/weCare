import { VitalLogDocument, VitalLogInput } from '../types/vitalLog.types'

export interface IVitalLogRepository {
    create(data: VitalLogInput): Promise<VitalLogDocument>
    findByPatientId(patientId: string): Promise<VitalLogDocument[]>
    findById(id: string): Promise<VitalLogDocument | null>
}
