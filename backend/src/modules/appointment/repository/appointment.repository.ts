import { Types } from 'mongoose'
import { singleton } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IAppointmentRepository } from '../interfaces/appointment.repository.interface'
import { AppointmentModel } from '../models/appointment.model'
import { AppointmentDocument } from '../types/appointment.types'

type AppointmentStatus = AppointmentDocument['status']

@singleton()
export class AppointmentRepository extends BaseRepository<AppointmentDocument> implements IAppointmentRepository {
    constructor() {
        super(AppointmentModel)
    }
    async create(data: Partial<AppointmentDocument>): Promise<AppointmentDocument> {
        return await this.model.create(data)
    }

    async findById(id: string): Promise<AppointmentDocument | null> {
        return await this.model.findById(id)
    }

    async findByIdPopulated(id: string): Promise<AppointmentDocument | null> {
        return await this.model
            .findById(id)
            .populate({
                path: 'doctorId',
                select: 'profileImage specializations verificationStatus',
                populate: {
                    path: 'userId',
                    select: 'name email',
                },
            })
            .populate('paymentId', 'status totalAmount consultationFee platformFee paidAt')
            .populate('cancelledBy', 'name')
    }

    async update(id: string, data: Partial<AppointmentDocument>): Promise<AppointmentDocument | null> {
        return await this.model.findByIdAndUpdate(id, data, { returnDocument: 'after' })
    }

    async findByPatientId(patientId: string): Promise<AppointmentDocument[]> {
        return await this.model
            .find({ patientId })
            .populate({
                path: 'doctorId',
                select: 'profileImage specializations',
                populate: {
                    path: 'userId',
                    select: 'name email',
                },
            })
            .populate('paymentId', 'status totalAmount')
            .populate('cancelledBy', 'name')
            .sort({ appointmentDate: -1, slotStart: -1 })
    }

    async findByDoctorId(doctorId: string): Promise<AppointmentDocument[]> {
        return await this.model
            .find({ doctorId })
            .populate('patientId', 'name email')
            .populate('paymentId', 'status totalAmount')
            .sort({ appointmentDate: -1, slotStart: -1 })
    }

    async findByDoctorIdForDate(doctorId: string, date: string): Promise<AppointmentDocument[]> {
        const [year, month, day] = date.split('-').map((value) => Number(value))
        const startOfDay = new Date(year, month - 1, day)
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999)

        return await this.model
            .find({
                doctorId,
                appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            })
            .populate('patientId', 'name email')
            .populate('paymentId', 'status totalAmount')
            .sort({ appointmentDate: -1, slotStart: -1 })
    }

    async findByDoctorIdAndDateRange(doctorId: string, startDate: Date, endDate: Date): Promise<AppointmentDocument[]> {
        return await this.model
            .find({
                doctorId,
                appointmentDate: { $gte: startDate, $lte: endDate },
            })
            .sort({ appointmentDate: -1, slotStart: -1 })
    }

    async findActiveAppointments(doctorId: string, date: string): Promise<AppointmentDocument[]> {
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        return await this.model.find({
            doctorId,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            $or: [
                { status: { $in: ['confirmed', 'in_consultation'] } },
                {
                    status: 'pending_payment',
                    expiredAt: { $gt: new Date() },
                },
            ],
        })
    }

    async findActiveByPatientAndDoctor(patientId: string, doctorId: string): Promise<AppointmentDocument | null> {
        return await this.model
            .findOne({
                patientId,
                doctorId,
                $or: [
                    {
                        status: { $in: ['confirmed', 'in_consultation'] },
                    },
                    {
                        status: 'pending_payment',
                        expiredAt: { $gt: new Date() },
                    },
                ],
            })
            .lean()
    }

    async findFutureCancellableAppointments(doctorId: string, fromDate: Date): Promise<AppointmentDocument[]> {
        const startOfDay = new Date(fromDate)
        startOfDay.setHours(0, 0, 0, 0)

        return await this.model
            .find({
                doctorId,
                appointmentDate: { $gte: startOfDay },
                $or: [
                    { status: 'confirmed' },
                    {
                        status: 'pending_payment',
                        expiredAt: { $gt: new Date() },
                    },
                ],
            })
            .populate('patientId', 'name email mobile')
            .populate('paymentId', 'status totalAmount')
            .sort({ appointmentDate: 1, slotStart: 1 })
    }

    async findPatientIdsByStatus(doctorId: string, statuses: AppointmentStatus[]): Promise<string[]> {
        const appointments = await this.model
            .find({
                doctorId,
                status: { $in: statuses },
            })
            .select('patientId')
            .lean()

        return [...new Set(appointments.map((appointment) => appointment.patientId.toString()))]
    }

    async findDoctorVisibleAppointmentsByDoctorAndPatientIds(
        doctorId: string,
        patientIds: string[],
    ): Promise<AppointmentDocument[]> {
        return await this.model
            .find({
                doctorId,
                patientId: { $in: patientIds },
                $or: [
                    {
                        status: { $in: ['confirmed', 'in_consultation', 'completed'] },
                    },
                ],
            })
            .sort({ updatedAt: -1, appointmentDate: -1, slotStart: -1 })
            .lean()
    }

    async findDoctorVisibleCurrentAppointment(
        doctorId: string,
        patientUserId: string,
    ): Promise<AppointmentDocument | null> {
        return await this.model
            .findOne({
                doctorId,
                patientId: patientUserId,
                $or: [
                    {
                        status: { $in: ['confirmed', 'in_consultation'] },
                    },
                ],
            })
            .sort({ appointmentDate: -1, slotStart: -1 })
            .lean()
    }

    async cancelAppointment(id: string, reason: string, cancelledBy: string): Promise<AppointmentDocument | null> {
        return await this.model.findByIdAndUpdate(
            id,
            {
                status: 'cancelled',
                cancelledAt: new Date(),
                cancelledBy: new Types.ObjectId(cancelledBy),
                cancellationReason: reason,
            },
            { returnDocument: 'after' },
        )
    }

    async getLastAppointmentId(): Promise<string | null> {
        const last = await this.model.findOne().sort({ appointmentId: -1 }).select('appointmentId').lean()
        return last?.appointmentId || null
    }

    async cancelFutureAppointmentsByPatientId(patientId: string, reason: string, cancelledBY: string): Promise<number> {
        const now = new Date()
        const result = await this.model.updateMany(
            {
                patientId: new Types.ObjectId(patientId),
                appointmentDate: { $gte: now },
                status: { $in: ['confirmed', 'pending_payment'] },
            },
            {
                $set: { status: 'cancelled' },
                cancelledAt: now,
                cancelledBy: new Types.ObjectId(cancelledBY),
            },
        )
        return result.modifiedCount
    }
}
