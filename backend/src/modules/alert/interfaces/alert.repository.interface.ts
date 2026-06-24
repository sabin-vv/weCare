import { AlertDocument } from '../types/alert.types'

export interface IAlertRepository {
    create(data: Partial<AlertDocument>): Promise<AlertDocument>
    findById(id: string): Promise<AlertDocument | null>
    findAll(filter: Record<string, unknown>): Promise<AlertDocument[]>
    update(id: string, data: Partial<AlertDocument>): Promise<AlertDocument | null>
    findByPatientId(patientId: string, filter?: Record<string, unknown>, limit?: number, page?: number): Promise<AlertDocument[]>
    findByPatientIds(patientIds: string[], filter?: Record<string, unknown>, limit?: number, page?: number): Promise<AlertDocument[]>
    countByPatientId(patientId: string, filter?: Record<string, unknown>): Promise<number>
    countByPatientIds(patientIds: string[], filter?: Record<string, unknown>): Promise<number>
}
