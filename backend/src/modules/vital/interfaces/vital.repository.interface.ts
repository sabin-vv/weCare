import { Types } from 'mongoose'

import { VitalDocument, VitalPlanDocument, VitalPlanStatus, VitalScheduleDocument,VitalType } from '../types/vital.types'

export interface IVitalRepository {
    create(data: Partial<VitalDocument>): Promise<VitalDocument>
    findById(id: string): Promise<VitalDocument | null>
    findByPatientId(patientId: string): Promise<VitalDocument[]>
    findByPatientIdAndType(patientId: string, type: VitalType): Promise<VitalDocument[]>
    createVitalPlan(data: Partial<VitalPlanDocument>): Promise<VitalPlanDocument>
    findVitalPlansByPatientId(patientId: string): Promise<VitalPlanDocument[]>
    findVitalPlansByPatientIdAndStatus(patientId: string, status: VitalPlanStatus): Promise<VitalPlanDocument[]>
    findActiveVitalPlans(): Promise<VitalPlanDocument[]>
    createVitalSchedule(data: Partial<VitalScheduleDocument>): Promise<VitalScheduleDocument>
    createManyVitalSchedules(data: Partial<VitalScheduleDocument>[]): Promise<void>
    findVitalSchedulesByPatientId(patientId: Types.ObjectId): Promise<VitalScheduleDocument[]>
    findByVitalPlanAndDate(
        vitalPlanId: Types.ObjectId,
        scheduleDate: Date,
        scheduleTime: Date,
    ): Promise<VitalScheduleDocument | null>
}
