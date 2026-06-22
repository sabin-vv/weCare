import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { IMedicationRepository } from '../interfaces/medication.repository.interface'
import { SystemGeneratedScheduleModel } from '../models/medicationSchedule.model'
import { MedicationScheduleInput, MedicationScheduleModel, ScheduleData } from '../types/medication.type'

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

    async findByPatientId(patientId: Types.ObjectId): Promise<MedicationScheduleModel[]> {
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date()
        endOfDay.setHours(23, 59, 59, 999)

        return SystemGeneratedScheduleModel.find({
            patientId,
            scheduleDate: { $gte: startOfDay, $lte: endOfDay },
        })
            .sort({ scheduleTime: 1 })
            .lean() as unknown as MedicationScheduleModel[]
    }

    async findByPatientAndCaregiver(patientId: Types.ObjectId): Promise<MedicationScheduleModel[]> {
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date()
        endOfDay.setHours(23, 59, 59, 999)

        const result = SystemGeneratedScheduleModel.find({
            patientId,
            scheduleDate: { $gte: startOfDay, $lte: endOfDay },
        })
            .sort({ scheduleTime: 1 })
            .lean() as unknown as MedicationScheduleModel[]

        const docs = await result

        return docs
    }

    async findScheduleById(scheduleId: string): Promise<MedicationScheduleModel | null> {
        return SystemGeneratedScheduleModel.findById(scheduleId).lean() as unknown as MedicationScheduleModel | null
    }

    async findPriorSchedule(patientId: Types.ObjectId, schedule: ScheduleData): Promise<MedicationScheduleModel[]> {
        return await SystemGeneratedScheduleModel.find({
            patientId: patientId,
            medicineName: schedule.medicineName,
            dosage: schedule.dosage,
            _id: { $ne: schedule._id },
            scheduleTime: { $lt: schedule.scheduleTime },
        })
            .sort({ scheduleTime: -1 })
            .limit(2)
            .lean()
    }

    async updateSchedule(
        scheduleId: string,
        data: Partial<MedicationScheduleModel>,
    ): Promise<MedicationScheduleModel | null> {
        return SystemGeneratedScheduleModel.findByIdAndUpdate(scheduleId, data, {
            new: true,
        }).lean() as unknown as MedicationScheduleModel | null
    }
    async cancelMedicationSchedulesByPatient(patientId: string, reason: string): Promise<void> {
        await SystemGeneratedScheduleModel.updateMany(
            { patientId: new Types.ObjectId(patientId), status: 'pending' },
            {
                $set: { status: 'cancelled', cancelledReason: reason },
            },
        )
    }
}
