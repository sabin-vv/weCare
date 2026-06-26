import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IAlertService } from '../../alert/interfaces/alert.service.interface'
import { ICaregiverActivityService } from '../../caregiverActivity/interfaces/caregiverActivity.service.interface'
import { IDoctorRepository } from '../../doctor/interfaces/doctor.repository.interface'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'
import { MSG } from '../constants/messages'
import { IVitalRepository } from '../interfaces/vital.repository.interface'
import { IVitalService } from '../interfaces/vital.service.interface'
import { VitalPlanDocument, VitalScheduleDocument, VitalScheduleDTO } from '../types/vital.types'
import { CreateVitalPlanDTO } from '../validator/vital.schema'

@injectable()
export class VitalService implements IVitalService {
    constructor(
        @inject(TOKENS.IVitalRepository) private _vitalRepo: IVitalRepository,
        @inject(TOKENS.IDoctorRepository) private _doctorRepo: IDoctorRepository,
        @inject(TOKENS.IPatientRepository) private _patientRepo: IPatientRepository,
        @inject(TOKENS.IAlertService) private _alertService: IAlertService,
        @inject(TOKENS.ICaregiverActivityService) private _activityService: ICaregiverActivityService,
    ) {}

    private async resolveDoctorAndPlan(doctorId: string, planId: string) {
        const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(doctorId))

        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.DOCTOR_PROFILE_NOT_FOUND)
        }

        const plan = await this._vitalRepo.findVitalPlanById(planId)

        if (!plan) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PLAN_NOT_FOUND)
        }
        return { doctor, plan }
    }

    private validatePlanOwnerShip(plan: VitalPlanDocument, doctorId: Types.ObjectId) {
        if (plan.requestedBy.toString() !== doctorId.toString()) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, MSG.NOT_AUTHORIZED_CHANGE_PLAN)
        }
    }

    async createVitalPlan(doctorUserId: string, dto: CreateVitalPlanDTO): Promise<VitalPlanDocument> {
        const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(doctorUserId))
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.DOCTOR_PROFILE_NOT_FOUND)
        }

        const patient = await this._patientRepo.findById(dto.patientId)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PATIENT_NOT_FOUND)
        }

        return await this._vitalRepo.createVitalPlan({
            patientId: patient._id,
            requestedBy: doctor._id,
            vitals: dto.vitals,
            instructions: dto.instructions,
            status: dto.status ?? 'active',
        })
    }

    async getPatientVitalPlans(patientId: string, status?: string): Promise<VitalPlanDocument[]> {
        const patient = await this._patientRepo.findById(patientId)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PATIENT_NOT_FOUND)
        }

        if (status) {
            return await this._vitalRepo.findVitalPlansByPatientIdAndStatus(
                patientId,
                status as VitalPlanDocument['status'],
            )
        }

        return await this._vitalRepo.findVitalPlansByPatientId(patientId)
    }

    async cancelVitalPlan(doctorUserId: string, planId: string): Promise<VitalPlanDocument> {
        const { doctor, plan } = await this.resolveDoctorAndPlan(doctorUserId, planId)

        this.validatePlanOwnerShip(plan, doctor._id)

        if (plan.status === 'cancelled') {
            return plan
        }

        const updatedPlan = await this._vitalRepo.updateVitalPlan(planId, { status: 'cancelled' })
        if (!updatedPlan) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PLAN_NOT_FOUND)
        }

        return updatedPlan
    }

    async generateDailyVitalSchedule(date: Date): Promise<{ created: number; skipped: number } | undefined> {
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        const vitalPlans = await this._vitalRepo.findActiveVitalPlans()

        const filteredPlans = vitalPlans.filter((plan) => {
            const createdAt = new Date(plan.createdAt)
            return createdAt <= endOfDay
        })

        const schedulesToCreate: Partial<VitalScheduleDocument>[] = []
        let skipped = 0

        for (const plan of filteredPlans) {
            const patient = await this._patientRepo.findById(plan.patientId.toString())
            if (!patient) continue

            const caregiverId = patient.caregiverId
            if (!caregiverId) continue

            for (const vital of plan.vitals) {
                const scheduleTimes = this.calculateScheduleTimes(vital.frequencyValue, vital.frequencyUnit)

                for (const timeStr of scheduleTimes) {
                    const [hours, minutes] = timeStr.split(':').map(Number)
                    const scheduleTime = new Date(date)
                    scheduleTime.setHours(hours, minutes, 0, 0)

                    const existing = await this._vitalRepo.findByVitalPlanAndDate(
                        plan._id as Types.ObjectId,
                        startOfDay,
                        scheduleTime,
                    )

                    if (existing) {
                        skipped++
                        continue
                    }

                    const durationMs = this.convertToMs(vital.durationValue, vital.durationUnit)
                    const endDate = new Date(startOfDay.getTime() + durationMs)

                    schedulesToCreate.push({
                        vitalPlanId: plan._id as Types.ObjectId,
                        patientId: plan.patientId as Types.ObjectId,
                        caregiverId: caregiverId as Types.ObjectId,
                        vitalType: vital.type,
                        scheduleDate: startOfDay,
                        scheduleTime,
                        endDate,
                        status: 'pending',
                    })
                }
            }
        }

        if (schedulesToCreate.length > 0) {
            await this._vitalRepo.createManyVitalSchedules(schedulesToCreate)
        }

        return { created: schedulesToCreate.length, skipped }
    }

    async getPatientVitalSchedules(userId: string): Promise<VitalScheduleDTO[]> {
        const patient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
        if (!patient) return []

        const schedules = await this._vitalRepo.findVitalSchedulesByPatientId(patient._id)

        return schedules.map((schedule) => ({
            _id: schedule._id.toString(),
            vitalType: schedule.vitalType,
            scheduleTime: schedule.scheduleTime.toISOString(),
            endDate: schedule.endDate.toISOString(),
            status: schedule.status,
            recordedValue: schedule.recordedValue,
            recordedAt: schedule.recordedAt?.toISOString(),
        }))
    }

    async markOverdueVitalsAsMissed(): Promise<{ updatedCount: number; criticalAlerts: number }> {
        const now = new Date()
        const graceMinutes = 60
        const threshold = new Date(now.getTime() - graceMinutes * 60 * 1000)

        const vitalSchedules = await this._vitalRepo.findOverduePendingSchedules(threshold)
        if (vitalSchedules.length === 0) {
            return { updatedCount: 0, criticalAlerts: 0 }
        }

        const ids = vitalSchedules.map((s) => s._id)
        await this._vitalRepo.markSchedulesAsMissed(ids)

        for (const schedule of vitalSchedules) {
            if (!schedule.caregiverId) continue
            await this._activityService.logActivity({
                caregiverId: schedule.caregiverId,
                patientId: schedule.patientId,
                activityType: 'vital_missed',
                referenceId: schedule._id,
                description: `${schedule.vitalType.replace(/_/g, ' ')} reading was not recorded within the allowed time window`,
            })
        }

        for (const schedule of vitalSchedules) {
            await this._alertService.createAlert({
                patientId: schedule.patientId,
                scheduleId: schedule._id,
                targetRole: ['caregiver'],
                type: 'missed_vital',
                severity: 'medium',
                triggerReason: `${schedule.vitalType.replace(/_/g, ' ')} reading was not recorded within the allowed time window`,
            })
            const priorSchedule = await this._vitalRepo.findPriorVitalSchedule(
                schedule.patientId.toString(),
                schedule.vitalType,
                schedule._id.toString(),
                schedule.scheduleTime,
            )
            if (priorSchedule.length >= 1 && priorSchedule[0].status === 'missed') {
                await this._alertService.createAlert({
                    patientId: schedule.patientId,
                    scheduleId: schedule._id,
                    type: 'missed_vital',
                    targetRole: ['doctor', 'caregiver'],
                    severity: 'critical',
                    triggerReason: `${schedule.vitalType.replace(/_/g, ' ')} missed ${priorSchedule.length + 1} consecutive times`,
                })
            }
        }

        return { updatedCount: vitalSchedules.length, criticalAlerts: vitalSchedules.length }
    }

    private calculateScheduleTimes(frequencyValue: number, frequencyUnit: string): string[] {
        const times: string[] = []
        if (frequencyUnit === 'hours') {
            for (let h = 8; h < 20; h += frequencyValue) {
                times.push(`${String(h).padStart(2, '0')}:00`)
            }
        } else if (frequencyUnit === 'days') {
            const timesPerDay = Math.max(1, Math.floor(24 / frequencyValue))
            const interval = Math.floor(24 / timesPerDay)
            for (let h = 8, count = 0; count < timesPerDay && h < 20; h += interval, count++) {
                times.push(`${String(h).padStart(2, '0')}:00`)
            }
        } else if (frequencyUnit === 'weeks') {
            times.push('09:00')
        }
        if (times.length === 0) {
            times.push('09:00')
        }
        return times
    }

    private convertToMs(value: number, unit: string): number {
        switch (unit) {
            case 'hours':
                return value * 60 * 60 * 1000
            case 'days':
                return value * 24 * 60 * 60 * 1000
            case 'weeks':
                return value * 7 * 24 * 60 * 60 * 1000
            case 'months':
                return value * 30 * 24 * 60 * 60 * 1000
            default:
                return value * 24 * 60 * 60 * 1000
        }
    }
}
