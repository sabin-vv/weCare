import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IVitalRepository } from '../interfaces/vital.repository.interface'
import { VitalModel } from '../models/vital.model'
import { vitalPlanModel } from '../models/vitalPlan.model'
import { vitalScheduleModel } from '../models/vitalSchedule.model'
import {
    VitalDocument,
    VitalPlanDocument,
    VitalPlanStatus,
    VitalScheduleDocument,
    VitalType,
} from '../types/vital.types'

@injectable()
export class VitalRepository extends BaseRepository<VitalDocument> implements IVitalRepository {
    constructor() {
        super(VitalModel)
    }

    async findByPatientId(patientId: string): Promise<VitalDocument[]> {
        return await this.model.find({ patientId }).sort({ recordedAt: -1, createdAt: -1 })
    }

    async findByPatientIdAndType(patientId: string, type: VitalType): Promise<VitalDocument[]> {
        return await this.model.find({ patientId, type }).sort({ recordedAt: -1, createdAt: -1 })
    }

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
    async findLatestByPatientId(patientId: string): Promise<VitalDocument[]> {
        return this.model.aggregate([
            { $match: { patientId: new Types.ObjectId(patientId) } },
            { $sort: { recordedAt: -1 } },
            { $group: { _id: '$type', doc: { $first: '$$ROOT' } } },
            { $replaceRoot: { newRoot: '$doc' } },
        ])
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
}
