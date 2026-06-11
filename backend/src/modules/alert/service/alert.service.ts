import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { getIO } from '../../../core/socket'
import { SOCKET_EVENTS } from '../../../core/socket/events'
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
    ) {}

    async getAlerts(
        userId: string,
        filters?: { type?: string; severity?: string; status?: string },
    ): Promise<AlertDocument[]> {
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
        if (patientIds.length === 0) return []

        const filter: Record<string, unknown> = {}
        if (filters?.type) filter.type = filters.type
        if (filters?.severity) filter.severity = filters.severity
        if (filters?.status) filter.status = filters.status
        else filter.status = 'open'

        return this._alertRepo.findByPatientIds(patientIds, filter)
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

        getIO().to(`user:${userId}`).emit(SOCKET_EVENTS.ALERT_ACKNOWLEDGED, updated)

        return updated
    }

    async createAlert(data: Partial<AlertDocument>): Promise<AlertDocument> {
        const alert = await this._alertRepo.create({
            ...data,
            triggeredAt: new Date(),
            status: 'open',
        })

        await this.emitNewAlert(alert)

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
        } catch {
            // socket emit failures should not break alert creation
        }
    }
}
