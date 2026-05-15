import { VitalDocument, VitalPlanDocument, VitalScheduleDTO } from '../types/vital.types'
import { CreateVitalDTO, CreateVitalPlanDTO } from '../validator/vital.schema'

export interface IVitalService {
    createVital(recordedBy: string, dto: CreateVitalDTO): Promise<VitalDocument>
    getPatientVitals(patientId: string, type?: string): Promise<VitalDocument[]>
    createVitalPlan(doctorUserId: string, dto: CreateVitalPlanDTO): Promise<VitalPlanDocument>
    getPatientVitalPlans(patientId: string, status?: string): Promise<VitalPlanDocument[]>
    generateDailyVitalSchedule(date: Date): Promise<{ created: number; skipped: number } | undefined>
    getPatientVitalSchedules(userId: string): Promise<VitalScheduleDTO[]>
    markOverdueVitalsAsMissed(): Promise<{ updatedCount: number; criticalAlerts: number }>
}
