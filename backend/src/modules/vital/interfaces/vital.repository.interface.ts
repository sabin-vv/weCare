import { Types } from 'mongoose'

import {
    VitalDocument,
    VitalPlanDocument,
    VitalPlanStatus,
    VitalPlanType,
    VitalScheduleDocument,
    VitalType,
} from '../types/vital.types'

export interface IVitalRepository {
    create(data: Partial<VitalDocument>): Promise<VitalDocument>
    findById(id: string): Promise<VitalDocument | null>
    findByPatientId(patientId: string): Promise<VitalDocument[]>
    findByPatientIdAndType(patientId: string, type: VitalType): Promise<VitalDocument[]>
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
        vitalType: VitalPlanType,
    ): Promise<VitalScheduleDocument | null>
    findLatestByPatientId(patientId: string): Promise<VitalDocument[]>
}
