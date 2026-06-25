import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { getIO } from '../../../core/socket'
import { SOCKET_EVENTS } from '../../../core/socket/events'
import { IActivityLogService } from '../../activityLog/interfaces/activityLog.service.interface'
import { IDoctorRepository } from '../../doctor/interfaces/doctor.repository.interface'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'
import { IAlertRepository } from '../interfaces/alert.repository.interface'
import { IAlertService } from '../interfaces/alert.service.interface'
import { AlertDocument } from '../types/alert.types'

@injectable()
export class AlertService implements IAlertService {
    constructor(
        @inject(TOKENS.IAlertRepository) private _alertRepo: IAlertRepository,
        @inject(TOKENS.IDoctorRepository) private _doctorRepo: IDoctorRepository,
        @inject(TOKENS.IPatientRepository) private _patientRepo: IPatientRepository,
        @inject(TOKENS.IActivityLogService) private _activityLogService: IActivityLogService,
    ) {}

    async getAlerts(
        userId: string,
        role: string,
        filters?: { type?: string; severity?: string; status?: string; limit?: number; page?: number },
    ): Promise<{
        alerts: AlertDocument[]
        pagination: { page: number; limit: number; totalCount: number; totalPages: number }
    }> {
        const filter: Record<string, unknown> = { targetRole: { $in: [role] } }
        if (filters?.type) filter.type = filters.type
        if (filters?.severity) filter.severity = filters.severity
        if (filters?.status) filter.status = filters.status

        const page = Math.max(1, filters?.page || 1)
        const limit = Math.max(1, filters?.limit || 8)

        const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(userId))
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor profile not found')
        }

        const patientsResult = await this._patientRepo.listPatientsByDoctor({
            primaryDoctorId: doctor._id,
            page: 1,
            limit: 1000,
            search: '',
        })

        const patientIds = patientsResult.data.map((p) => p._id.toString())
        if (patientIds.length === 0) {
            return { alerts: [], pagination: { page, limit, totalCount: 0, totalPages: 0 } }
        }

        const [alerts, total] = await Promise.all([
            this._alertRepo.findByPatientIds(patientIds, filter, limit, page),
            this._alertRepo.countByPatientIds(patientIds, filter),
        ])
        return { alerts, pagination: { page, limit, totalCount: total, totalPages: Math.ceil(total / limit) } }
    }

    async acknowledgeAlert(userId: string, alertId: string, note?: string): Promise<AlertDocument> {
        const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(userId))
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor profile not found')
        }

        const alert = await this._alertRepo.findById(alertId)
        if (!alert) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Alert not found')
        }

        const patient = await this._patientRepo.findById(alert.patientId.toString())
        if (!patient || patient.primaryDoctorId?.toString() !== doctor._id.toString()) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'You are not authorized to acknowledge this alert')
        }

        const updated = await this._alertRepo.update(alertId, {
            status: 'acknowledged',
            acknowledgeBy: doctor._id,
            acknowledgeAt: new Date(),
            acknowledgeNote: note ?? '',
        })

        if (!updated) {
            throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to acknowledge alert')
        }

        await this._activityLogService.logActivity({
            performedBy: userId,
            performedByRole: 'doctor',
            category: 'alert',
            action: 'alert_acknowledged',
            patientId: alert.patientId.toString(),
            targetId: alertId,
            targetType: 'alert',
            description: `Alert acknowledged by doctor: ${alert.severity} ${alert.type.replace(/_/g, ' ')}${note ? ` - ${note}` : ''}`,
        })

        return updated
    }

    async getAlertsByPatientIds(
        patientIds: string[],
        filters?: { type?: string; severity?: string; status?: string; limit?: number; page?: number },
    ): Promise<{ alerts: AlertDocument[]; pagination: { page: number; limit: number; totalCount: number; totalPages: number } }> {
        if (patientIds.length === 0) {
            const page = Math.max(1, filters?.page || 1)
            const limit = Math.max(1, filters?.limit || 8)
            return { alerts: [], pagination: { page, limit, totalCount: 0, totalPages: 0 } }
        }

        const filter: Record<string, unknown> = { targetRole: { $in: ['caregiver'] } }
        if (filters?.type) filter.type = filters.type
        if (filters?.severity) filter.severity = filters.severity
        if (filters?.status) filter.status = filters.status

        const page = Math.max(1, filters?.page || 1)
        const limit = Math.max(1, filters?.limit || 8)

        const [alerts, total] = await Promise.all([
            this._alertRepo.findByPatientIds(patientIds, filter, limit, page),
            this._alertRepo.countByPatientIds(patientIds, filter),
        ])
        return { alerts, pagination: { page, limit, totalCount: total, totalPages: Math.ceil(total / limit) } }
    }

    async getPatientAlertCount(userId: string): Promise<number> {
        const patient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
        if (!patient) return 0

        const alerts = await this._alertRepo.findByPatientId(patient._id.toString(), { status: 'open' })
        return alerts.length
    }

    async createAlert(data: Partial<AlertDocument>): Promise<AlertDocument> {
        const alert = await this._alertRepo.create({
            ...data,
            triggeredAt: new Date(),
            status: 'open',
        })

        await this.emitNewAlert(alert)

        await this._activityLogService.logActivity({
            performedByRole: 'system',
            category: 'alert',
            action: 'alert_triggered',
            patientId: alert.patientId.toString(),
            targetId: alert._id.toString(),
            targetType: 'alert',
            description: `${alert.severity} ${alert.type.replace(/_/g, ' ')} - ${alert.triggerReason}`,
        })

        return alert
    }

    private async emitNewAlert(alert: AlertDocument): Promise<void> {
        try {
            const patient = await this._patientRepo.findById(alert.patientId.toString())
            if (!patient?.primaryDoctorId) return

            const doctor = await this._doctorRepo.findById(patient.primaryDoctorId.toString())
            if (!doctor?.userId) return

            const populated = await this._alertRepo.findById(alert._id.toString())
            if (populated) {
                getIO().to(`user:${doctor.userId.toString()}`).emit(SOCKET_EVENTS.NEW_ALERT, populated)
            }
        } catch (error) {
            console.error('Failed to emit new alert notification', error)
        }
    }
}
