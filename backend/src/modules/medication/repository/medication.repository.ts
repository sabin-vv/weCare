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

        console.log('[MedicationRepo] findByPatientAndCaregiver:', {
            patientId: patientId.toString(),
            startOfDay: startOfDay.toISOString(),
            endOfDay: endOfDay.toISOString(),
        })

        const result = SystemGeneratedScheduleModel.find({
            patientId,
            scheduleDate: { $gte: startOfDay, $lte: endOfDay },
        })
            .sort({ scheduleTime: 1 })
            .lean() as unknown as MedicationScheduleModel[]

        const docs = await result
        console.log('[MedicationRepo] query result count:', docs.length)
        if (docs.length > 0) {
            console.log('[MedicationRepo] first doc patientId:', docs[0].patientId?.toString())
            console.log('[MedicationRepo] first doc scheduleDate:', docs[0].scheduleDate?.toISOString())
        }

        return docs
    }
}
