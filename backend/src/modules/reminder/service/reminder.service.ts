import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { ICaregiverRepository } from '../../caregiver/interfaces/caregiver.repository.interface'
import { SystemGeneratedScheduleModel } from '../../medication/models/medicationSchedule.model'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'
import { vitalScheduleModel } from '../../vital/models/vitalSchedule.model'
import { IReminderRepository } from '../interfaces/reminder.repository.interface'
import { IReminderService } from '../interfaces/reminder.service.interface'
import {
    CreateReminderDTO,
    ReminderDocument,
    ReminderItem,
    RemindersResponse,
    UpdateReminderDTO,
} from '../types/reminder.types'

@injectable()
export class ReminderService implements IReminderService {
    constructor(
        @inject(TOKENS.ICaregiverRepository) private _caregiverRepo: ICaregiverRepository,
        @inject(TOKENS.IPatientRepository) private _patientRepo: IPatientRepository,
        @inject(TOKENS.IReminderRepository) private _reminderRepo: IReminderRepository,
    ) {}

    async getReminders(caregiverUserId: string): Promise<RemindersResponse> {
        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(caregiverUserId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver profile not found')
        }

        const caregiverId = caregiver._id as Types.ObjectId

        const [medicationSchedules, vitalSchedules, customReminders] = await Promise.all([
            SystemGeneratedScheduleModel.find({
                caregiverId,
                status: { $in: ['pending', 'missed'] },
            })
                .populate('patientId', 'userId')
                .sort({ scheduleTime: 1 })
                .lean(),

            vitalScheduleModel
                .find({
                    caregiverId,
                    status: { $in: ['pending', 'missed'] },
                })
                .populate('patientId', 'userId')
                .sort({ scheduleTime: 1 })
                .lean(),

            this._reminderRepo.findByCaregiverId(caregiverId.toString()),
        ])

        const systemReminders: ReminderItem[] = [
            ...medicationSchedules.map((schedule) => ({
                _id: (schedule._id as Types.ObjectId).toString(),
                source: 'medication' as const,
                title: `${schedule.medicineName} ${schedule.dosage}`,
                description: `Route: ${schedule.route}`,
                scheduleTime: schedule.scheduleTime,
                priority: schedule.priority as ReminderItem['priority'],
                status: schedule.status === 'missed' ? ('missed' as const) : ('pending' as const),
            })),
            ...vitalSchedules.map((schedule) => ({
                _id: (schedule._id as Types.ObjectId).toString(),
                source: 'vital' as const,
                title: `Vital Check - ${schedule.vitalType}`,
                scheduleTime: schedule.scheduleTime,
                priority: schedule.priority as ReminderItem['priority'],
                status: schedule.status === 'missed' ? ('missed' as const) : ('pending' as const),
            })),
        ]

        const customItems: ReminderItem[] = await Promise.all(
            customReminders
                .filter((r) => r.status === 'pending')
                .map(async (r) => {
                    let patientName: string | undefined
                    if (r.patientId) {
                        const patient = await this._patientRepo.findById(r.patientId.toString())
                        patientName = patient ? `Patient #${patient.patientId}` : undefined
                    }
                    return {
                        _id: r._id.toString(),
                        source: 'custom' as ReminderItem['source'],
                        title: r.title,
                        description: r.description || undefined,
                        patientId: r.patientId?.toString(),
                        patientName,
                        scheduleTime: r.scheduleTime,
                        priority: r.priority,
                        status: r.status,
                    } as ReminderItem
                }),
        )

        const allReminders = [...systemReminders, ...customItems].sort(
            (a, b) => new Date(a.scheduleTime).getTime() - new Date(b.scheduleTime).getTime(),
        )

        const pendingCount = allReminders.filter((r) => r.status === 'pending').length
        const completedCount = allReminders.filter((r) => r.status === 'completed').length

        return {
            reminders: allReminders,
            total: allReminders.length,
            pendingCount,
            completedCount,
        }
    }

    async createReminder(caregiverUserId: string, dto: CreateReminderDTO): Promise<ReminderDocument> {
        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(caregiverUserId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver profile not found')
        }

        return this._reminderRepo.create({
            caregiverId: caregiver._id as Types.ObjectId,
            patientId: dto.patientId ? new Types.ObjectId(dto.patientId) : undefined,
            title: dto.title,
            description: dto.description ?? '',
            scheduleTime: new Date(dto.scheduleTime),
            priority: dto.priority ?? 'medium',
            status: 'pending',
        })
    }

    async updateReminder(reminderId: string, dto: UpdateReminderDTO): Promise<ReminderDocument> {
        const reminder = await this._reminderRepo.findById(reminderId)
        if (!reminder) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Reminder not found')
        }

        const updateData: Partial<ReminderDocument> = {}
        if (dto.patientId !== undefined) updateData.patientId = new Types.ObjectId(dto.patientId)
        if (dto.title !== undefined) updateData.title = dto.title
        if (dto.description !== undefined) updateData.description = dto.description
        if (dto.scheduleTime !== undefined) updateData.scheduleTime = new Date(dto.scheduleTime)
        if (dto.priority !== undefined) updateData.priority = dto.priority
        if (dto.status !== undefined) updateData.status = dto.status

        const updated = await this._reminderRepo.update(reminderId, updateData)
        if (!updated) {
            throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update reminder')
        }

        return updated
    }

    async markReminderDone(reminderId: string): Promise<ReminderDocument> {
        const reminder = await this._reminderRepo.findById(reminderId)
        if (!reminder) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Reminder not found')
        }

        const updated = await this._reminderRepo.update(reminderId, { status: 'completed' })
        if (!updated) {
            throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update reminder')
        }

        return updated
    }

    async deleteReminder(reminderId: string): Promise<void> {
        const reminder = await this._reminderRepo.findById(reminderId)
        if (!reminder) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Reminder not found')
        }

        await this._reminderRepo.delete(reminderId)
    }
}
