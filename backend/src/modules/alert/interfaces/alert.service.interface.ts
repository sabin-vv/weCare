import { AlertDocument } from '../types/alert.types'

export interface IAlertService {
    getAlerts(
        userId: string,
        filters?: { type?: string; severity?: string; status?: string; limit?: number },
    ): Promise<AlertDocument[]>
    getPatientAlertCount(userId: string): Promise<number>
    acknowledgeAlert(userId: string, alertId: string, note?: string): Promise<AlertDocument>
    createAlert(data: Partial<AlertDocument>): Promise<AlertDocument>
}
