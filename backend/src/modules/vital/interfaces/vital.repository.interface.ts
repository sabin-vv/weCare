import { Types } from 'mongoose'

import {
    VitalPlanDocument,
    VitalPlanStatus,
    VitalScheduleDocument,
    VitalType,
} from '../types/vital.types'

export interface IVitalRepository {
    createVitalPlan(data: Partial<VitalPlanDocument>): Promise<VitalPlanDocument>
    findVitalPlanById(planId: string): Promise<VitalPlanDocument | null>
    findVitalPlansByPatientId(patientId: string): Promise<VitalPlanDocument[]>
    findVitalPlansByPatientIdAndStatus(patientId: string, status: VitalPlanStatus): Promise<VitalPlanDocument[]>
    updateVitalPlan(planId: string, data: Partial<VitalPlanDocument>): Promise<VitalPlanDocument | null>
    findActiveVitalPlans(): Promise<VitalPlanDocument[]>
    createVitalSchedule(data: Partial<VitalScheduleDocument>): Promise<VitalScheduleDocument>
    createManyVitalSchedules(data: Partial<VitalScheduleDocument>[]): Promise<void>
    findVitalSchedulesByPatientId(patientId: Types.ObjectId): Promise<VitalScheduleDocument[]>
    findByVitalPlanAndDate(
        vitalPlanId: Types.ObjectId,
        scheduleDate: Date,
        scheduleTime: Date,
    ): Promise<VitalScheduleDocument | null>
    findVitalScheduleById(scheduleId: string): Promise<VitalScheduleDocument | null>
    updateVitalSchedule(scheduleId: string, data: Partial<VitalScheduleDocument>): Promise<VitalScheduleDocument | null>
    findLoggableVitalScheduleByPatientAndType(
        patientId: Types.ObjectId,
        vitalType: VitalType,
    ): Promise<VitalScheduleDocument | null>
    findLatestRecordedSchedulesByPatientId(patientId: Types.ObjectId): Promise<VitalScheduleDocument[]>
    findOverduePendingSchedules(threshold: Date): Promise<VitalScheduleDocument[]>
    markSchedulesAsMissed(ids: Types.ObjectId[]): Promise<void>
    pauseVitalPlanByPatientId(patientId: string, reason: string): Promise<void>
    cancelPendingSchedulesByPatient(patientId: string, reason: string): Promise<void>
    completeVitalPlanByPatientId(patientId: string): Promise<void>
    resumeVitalPlanByPatientId(patientId: string): Promise<void>
}
