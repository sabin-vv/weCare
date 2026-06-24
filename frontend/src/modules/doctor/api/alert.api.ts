import type { AlertData, AlertsResponse, AcknowledgeResponse, Pagination } from '../types/doctor.types'

import { api } from '@/services/api'
import { ALERTS_API } from '@/shared/constants/api.constants'

export const getAlerts = async (
    filters?: { type?: string; severity?: string; status?: string; limit?: number; page?: number },
): Promise<{ alerts: AlertData[]; pagination: Pagination }> => {
    const res = await api.get<AlertsResponse>(ALERTS_API, { params: filters })
    return res.data.data
}

export const acknowledgeAlert = async (alertId: string, note?: string): Promise<AlertData> => {
    const res = await api.patch<AcknowledgeResponse>(`${ALERTS_API}/${alertId}/acknowledge`, { note })
    return res.data.data
}
