import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { IMedicationRepository } from '../interfaces/medication.repository.interface'
import { SystemGeneratedScheduleModel } from '../model/medicationSchedule.model'
import { MedicationScheduleInput, MedicationScheduleModel } from '../types/medication.type'

@injectable()
export class MedicationRepository implements IMedicationRepository {
    async findByPrescriptionAndDate(
        prescriptionId: Types.ObjectId,
        scheduleDate: Date,
        scheduleTime: Date,
    ): Promise<MedicationScheduleModel | null> {
        return SystemGeneratedScheduleModel.findOne({
            prescriptionId,
            scheduleDate,
            scheduleTime,
        }).lean() as unknown as MedicationScheduleModel | null
    }

    async findByPatientAndDate(patientId: Types.ObjectId, scheduleDate: Date): Promise<MedicationScheduleModel[]> {
        return SystemGeneratedScheduleModel.find({
            patientId,
            scheduleDate,
        }).lean() as unknown as MedicationScheduleModel[]
    }

    async createMany(schedules: MedicationScheduleInput[]): Promise<void> {
        if (schedules.length === 0) return
        await SystemGeneratedScheduleModel.insertMany(schedules, { ordered: false })
    }
}
