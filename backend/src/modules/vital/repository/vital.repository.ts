import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { IVitalRepository } from '../interfaces/vital.repository.interface'
import { vitalPlanModel } from '../models/vitalPlan.model'
import { vitalScheduleModel } from '../models/vitalSchedule.model'
import { VitalPlanDocument, VitalPlanStatus, VitalScheduleDocument, VitalType } from '../types/vital.types'

@injectable()
export class VitalRepository implements IVitalRepository {
    async createVitalPlan(data: Partial<VitalPlanDocument>): Promise<VitalPlanDocument> {
        return await vitalPlanModel.create(data)
    }

    async findVitalPlanById(planId: string): Promise<VitalPlanDocument | null> {
        return await vitalPlanModel.findById(planId)
    }

    async findVitalPlansByPatientId(patientId: string): Promise<VitalPlanDocument[]> {
        return await vitalPlanModel.find({ patientId }).sort({ createdAt: -1 })
    }

    async findVitalPlansByPatientIdAndStatus(patientId: string, status: VitalPlanStatus): Promise<VitalPlanDocument[]> {
        return await vitalPlanModel.find({ patientId, status }).sort({ createdAt: -1 })
    }

    async updateVitalPlan(planId: string, data: Partial<VitalPlanDocument>): Promise<VitalPlanDocument | null> {
        return await vitalPlanModel.findByIdAndUpdate(planId, data, { new: true })
    }

    async findActiveVitalPlans(): Promise<VitalPlanDocument[]> {
        return await vitalPlanModel.find({ status: 'active' }).sort({ createdAt: -1 }).lean()
    }

    async createVitalSchedule(data: Partial<VitalScheduleDocument>): Promise<VitalScheduleDocument> {
        return await vitalScheduleModel.create(data)
    }

    async createManyVitalSchedules(data: Partial<VitalScheduleDocument>[]): Promise<void> {
        if (data.length === 0) return
        await vitalScheduleModel.insertMany(data, { ordered: false })
    }

    async findVitalSchedulesByPatientId(patientId: Types.ObjectId): Promise<VitalScheduleDocument[]> {
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(startOfDay)
        endOfDay.setHours(23, 59, 59, 999)

        return vitalScheduleModel
            .find({
                patientId,
                scheduleDate: { $gte: startOfDay, $lte: endOfDay },
            })
            .sort({ scheduleTime: 1 })
            .lean() as unknown as VitalScheduleDocument[]
    }

    async findByVitalPlanAndDate(
        vitalPlanId: Types.ObjectId,
        scheduleDate: Date,
        scheduleTime: Date,
    ): Promise<VitalScheduleDocument | null> {
        return vitalScheduleModel
            .findOne({
                vitalPlanId,
                scheduleDate,
                scheduleTime,
            })
            .lean() as unknown as VitalScheduleDocument | null
    }

    async findVitalScheduleById(scheduleId: string): Promise<VitalScheduleDocument | null> {
        return vitalScheduleModel.findById(scheduleId).lean() as unknown as VitalScheduleDocument | null
    }

    async updateVitalSchedule(
        scheduleId: string,
        data: Partial<VitalScheduleDocument>,
    ): Promise<VitalScheduleDocument | null> {
        return vitalScheduleModel
            .findByIdAndUpdate(scheduleId, data, {
                new: true,
            })
            .lean() as unknown as VitalScheduleDocument | null
    }

    async findLoggableVitalScheduleByPatientAndType(
        patientId: Types.ObjectId,
        vitalType: VitalType,
    ): Promise<VitalScheduleDocument | null> {
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(startOfDay)
        endOfDay.setHours(23, 59, 59, 999)

        return vitalScheduleModel
            .findOne({
                patientId,
                vitalType,
                scheduleDate: { $gte: startOfDay, $lte: endOfDay },
                status: { $in: ['pending', 'missed'] },
            })
            .sort({ scheduleTime: 1 })
            .lean() as unknown as VitalScheduleDocument | null
    }

    async findLatestRecordedSchedulesByPatientId(patientId: Types.ObjectId): Promise<VitalScheduleDocument[]> {
        return vitalScheduleModel.aggregate([
            { $match: { patientId, status: 'recorded', recordedAt: { $ne: null } } },
            { $sort: { recordedAt: -1 } },
            { $group: { _id: '$vitalType', doc: { $first: '$$ROOT' } } },
            { $replaceRoot: { newRoot: '$doc' } },
        ]) as unknown as VitalScheduleDocument[]
    }

    async findOverduePendingSchedules(threshold: Date): Promise<VitalScheduleDocument[]> {
        return vitalScheduleModel
            .find({
                status: 'pending',
                scheduleTime: { $lt: threshold },
            })
            .lean() as unknown as VitalScheduleDocument[]
    }

    async markSchedulesAsMissed(ids: Types.ObjectId[]): Promise<void> {
        await vitalScheduleModel.updateMany({ _id: { $in: ids } }, { $set: { status: 'missed' } })
    }

    async pauseVitalPlanByPatientId(patientId: string, reason: string): Promise<void> {
        await vitalPlanModel.updateMany(
            {
                patientId: new Types.ObjectId(patientId),
                status: 'active',
            },
            {
                $set: {
                    status: 'paused',
                    statusReason: reason,
                },
            },
        )
    }

    async cancelPendingSchedulesByPatient(patientId: string, reason: string): Promise<void> {
        await vitalScheduleModel.updateMany(
            {
                patientId: new Types.ObjectId(patientId),
                status: 'pending',
            },
            {
                $set: {
                    status: 'cancelled',
                    statusReason: reason,
                },
            },
        )
    }

    async completeVitalPlanByPatientId(patientId: string): Promise<void> {
        await vitalPlanModel.updateMany(
            {
                patientId: new Types.ObjectId(patientId),
                status: { $in: ['active', 'paused'] },
            },
            {
                $set: { status: 'completed' },
            },
        )
    }

    async findPriorVitalSchedule(
        patientId: string,
        vitalType: VitalType,
        currentId: string,
        scheduleTime: Date,
    ): Promise<VitalScheduleDocument[]> {
        return vitalScheduleModel
            .find({
                patientId: new Types.ObjectId(patientId),
                vitalType,
                _id: { $ne: new Types.ObjectId(currentId) },
                scheduleTime: { $lt: scheduleTime },
            })
            .sort({ scheduleTime: -1 })
            .limit(1)
            .lean()
    }

    async resumeVitalPlanByPatientId(patientId: string): Promise<void> {
        await vitalPlanModel.updateMany(
            {
                patientId: new Types.ObjectId(patientId),
                status: 'paused',
            },
            {
                $set: { status: 'active' },
                $unset: { statusReason: '' },
            },
        )
    }
}
