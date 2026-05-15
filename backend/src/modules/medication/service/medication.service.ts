import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'
import { PrescriptionModel } from '../../prescription/models/prescription.model'
import { SystemGeneratedScheduleModel } from '../model/medicationSchedule.model'
import { IMedicationRepository } from '../interfaces/medication.repository.interface'
import { IMedicationService } from '../interfaces/medication.service.interface'
import { MedicationScheduleDTO, MedicationScheduleInput } from '../types/medication.type'

@injectable()
export class MedicationService implements IMedicationService {
    constructor(
        @inject(TOKENS.IMedicationRepository) private _medicationRepo: IMedicationRepository,
        @inject(TOKENS.IPatientRepository) private _patientRepo: IPatientRepository,
    ) {}

    async generateDailySchedule(date: Date): Promise<{ created: number; skipped: number } | undefined> {
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        const prescriptions = await PrescriptionModel.find({
            status: 'active',
            prescribedAt: { $lte: endOfDay },
            $or: [{ endDate: { $gte: startOfDay } }, { endDate: { $exists: false } }],
        }).lean()

        const schedulesToCreate: MedicationScheduleInput[] = []
        let skipped = 0

        for (const prescription of prescriptions) {
            const patient = await this._patientRepo.findById(prescription.patientId.toString())
            if (!patient) continue

            const caregiverId = patient.caregiverId
            if (!caregiverId) {
                return
            }

            for (const medication of prescription.medications) {
                if (!medication.scheduleTimes || medication.scheduleTimes.length === 0) continue

                for (const timeStr of medication.scheduleTimes) {
                    const [hours, minutes] = timeStr.split(':').map(Number)
                    const scheduleTime = new Date(date)
                    scheduleTime.setHours(hours, minutes, 0, 0)

                    const existing = await this._medicationRepo.findByPrescriptionAndDate(
                        prescription._id as Types.ObjectId,
                        startOfDay,
                        scheduleTime,
                    )

                    if (existing) {
                        skipped++
                        continue
                    }

                    schedulesToCreate.push({
                        prescriptionId: prescription._id as Types.ObjectId,
                        patientId: prescription.patientId as Types.ObjectId,
                        caregiverId: caregiverId as Types.ObjectId,
                        medicineName: medication.name,
                        dosage: medication.dosage,
                        route: medication.route,
                        scheduleDate: startOfDay,
                        scheduleTime,
                        priority:
                            (medication.priority?.toLowerCase() as MedicationScheduleInput['priority']) || 'medium',
                        status: 'pending',
                    })
                }
            }
        }

        if (schedulesToCreate.length > 0) {
            await this._medicationRepo.createMany(schedulesToCreate)
        }

        return {
            created: schedulesToCreate.length,
            skipped,
        }
    }

    async getPatientMedications(userId: string): Promise<MedicationScheduleDTO[]> {
        const patient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
        if (!patient) return []

        const schedules = await this._medicationRepo.findByPatientId(patient._id)

        return schedules.map((schedule) => ({
            _id: schedule._id.toString(),
            medicineName: schedule.medicineName,
            dosage: schedule.dosage,
            route: schedule.route,
            scheduleTime: schedule.scheduleTime.toISOString(),
            priority: schedule.priority,
            status: schedule.status,
            administeredAt: schedule.administeredAt?.toISOString(),
            administrationNotes: schedule.administrationNotes,
        }))
    }

    async markOverdueMedicationsAsMissed(): Promise<{ updatedCount: number; criticalAlerts: number }> {
        const now = new Date()
        const graceMinutes = 60

        const threshold = new Date(now.getTime() - graceMinutes * 60 * 1000)

        console.log(`[MedicationMissedCron] Running at ${now.toISOString()}`)
        console.log(`[MedicationMissedCron] Threshold: ${threshold.toISOString()}`)

        const updateResult = await SystemGeneratedScheduleModel.updateMany(
            {
                status: 'pending',
                scheduleTime: {
                    $lt: threshold,
                },
            },
            {
                $set: {
                    status: 'missed',
                    missedReason: 'Medication not administered within allowed time window',
                    missedAt: new Date(),
                },
            },
        )

        console.log(`[MedicationMissedCron] Updated ${updateResult.modifiedCount} schedules as missed`)

        if (updateResult.modifiedCount === 0) {
            return { updatedCount: 0, criticalAlerts: 0 }
        }

        const missedSchedules = await SystemGeneratedScheduleModel.find({
            status: 'missed',
            missedAt: {
                $gte: new Date(now.getTime() - 10 * 60 * 1000),
            },
            priority: 'critical',
        }).lean()

        const criticalAlerts = missedSchedules.length

        if (criticalAlerts > 0) {
            console.log(`[MedicationMissedCron] Found ${criticalAlerts} critical missed medications`)
            for (const schedule of missedSchedules) {
                console.log(
                    `[MedicationMissedCron] ALERT: Critical medication missed - Patient: ${schedule.patientId}, Medicine: ${schedule.medicineName}, Schedule: ${schedule.scheduleTime}`,
                )
            }
        }

        return { updatedCount: updateResult.modifiedCount, criticalAlerts }
    }
}
