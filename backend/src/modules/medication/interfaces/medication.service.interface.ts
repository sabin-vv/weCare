import type { MedicationScheduleDTO } from '../types/medication.type'

export interface IMedicationService {
    generateDailySchedule(date: Date): Promise<{ created: number; skipped: number } | undefined>
    getPatientMedications(userId: string): Promise<MedicationScheduleDTO[]>
    markOverdueMedicationsAsMissed(): Promise<{ updatedCount: number; criticalAlerts: number }>
}
