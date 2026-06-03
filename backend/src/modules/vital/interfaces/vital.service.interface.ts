import { VitalPlanDocument, VitalScheduleDTO } from '../types/vital.types'
import { CreateVitalPlanDTO } from '../validator/vital.schema'

export interface IVitalService {
    createVitalPlan(doctorUserId: string, dto: CreateVitalPlanDTO): Promise<VitalPlanDocument>
    getPatientVitalPlans(patientId: string, status?: string): Promise<VitalPlanDocument[]>
    cancelVitalPlan(doctorUserId: string, planId: string): Promise<VitalPlanDocument>
    generateDailyVitalSchedule(date: Date): Promise<{ created: number; skipped: number } | undefined>
    getPatientVitalSchedules(userId: string): Promise<VitalScheduleDTO[]>
}
