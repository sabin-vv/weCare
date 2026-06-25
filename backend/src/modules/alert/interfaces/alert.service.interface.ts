import { AlertDocument } from '../types/alert.types'

export interface IAlertService {
    getAlerts(
        userId: string,
        role: string,
        filters?: { type?: string; severity?: string; status?: string; limit?: number; page?: number },
    ): Promise<{ alerts: AlertDocument[]; pagination: { page: number; limit: number; totalCount: number; totalPages: number } }>
    getAlertsByPatientIds(
        patientIds: string[],
        filters?: { type?: string; severity?: string; status?: string; limit?: number; page?: number },
    ): Promise<{ alerts: AlertDocument[]; pagination: { page: number; limit: number; totalCount: number; totalPages: number } }>
    getPatientAlertCount(userId: string): Promise<number>
    acknowledgeAlert(userId: string, alertId: string, note?: string): Promise<AlertDocument>
    createAlert(data: Partial<AlertDocument>): Promise<AlertDocument>
}
