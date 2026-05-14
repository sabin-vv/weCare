import { Types } from 'mongoose'

import { MedicationScheduleInput, MedicationScheduleModel } from '../types/medication.type'

export interface IMedicationRepository {
    createMany(schedules: MedicationScheduleInput[]): Promise<void>
    findByPrescriptionAndDate(
        prescriptionId: Types.ObjectId,
        scheduleDate: Date,
        scheduleTime: Date,
    ): Promise<MedicationScheduleModel | null>
    findByPatientAndDate(patientId: Types.ObjectId, scheduleDate: Date): Promise<MedicationScheduleModel[]>

    findByPatientId(patientId: Types.ObjectId): Promise<MedicationScheduleModel[]>

    findByPatientAndCaregiver(patientId: Types.ObjectId): Promise<MedicationScheduleModel[]>
}
