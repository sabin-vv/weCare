import { Types } from 'mongoose'
import { singleton } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IAppointmentRepository } from '../interfaces/appointment.repository.interface'
import { AppointmentModel } from '../models/appointment.model'
import { AppointmentDocument } from '../types/appointment.types'

@singleton()
export class AppointmentRepository extends BaseRepository<AppointmentDocument> implements IAppointmentRepository {
    async create(data: Partial<AppointmentDocument>): Promise<AppointmentDocument> {
        return await AppointmentModel.create(data)
    }

    async findById(id: string): Promise<AppointmentDocument | null> {
        return await AppointmentModel.findById(id)
    }

    async findByOrderId(orderId: string): Promise<AppointmentDocument | null> {
        return await AppointmentModel.findOne({ razorpayOrderId: orderId })
    }

    async update(id: string, data: Partial<AppointmentDocument>): Promise<AppointmentDocument | null> {
        return await AppointmentModel.findByIdAndUpdate(id, data, { returnDocument: 'after' })
    }

    async findByPatientId(patientId: string): Promise<AppointmentDocument[]> {
        return await AppointmentModel.find({ patientId })
            .populate({
                path: 'doctorId',
                populate: {
                    path: 'userId',
                    select: 'name email',
                },
            })
            .populate('paymentId', 'status totalAmount')
            .sort({ appointmentDate: -1, slotStart: -1 })
    }

    async findByDoctorId(doctorId: string): Promise<AppointmentDocument[]> {
        return await AppointmentModel.find({ doctorId })
            .populate('patientId', 'name email')
            .populate('paymentId', 'status totalAmount')
            .sort({ appointmentDate: -1, slotStart: -1 })
    }

    async findActiveAppointments(doctorId: string, date: string): Promise<AppointmentDocument[]> {
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        return await AppointmentModel.find({
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
        return await AppointmentModel.findOne({
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
        }).lean()
    }

    async findFutureCancellableAppointments(doctorId: string, fromDate: Date): Promise<AppointmentDocument[]> {
        const startOfDay = new Date(fromDate)
        startOfDay.setHours(0, 0, 0, 0)

        return await AppointmentModel.find({
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


    async findPatientIdsByStatus(doctorId: string, statuses: string[]): Promise<string[]> {
        const appointments = await AppointmentModel.find({
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
        return await AppointmentModel.find({
            doctorId,
            patientId: { $in: patientIds },
            $or: [
                {
                    status: { $in: ['confirmed', 'in_consultation'] },
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
        return await AppointmentModel.findOne({
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
        return await AppointmentModel.findByIdAndUpdate(
            id,
            {
                status: 'cancelled',
                cancelledAt: new Date(),
                cancelledBy: new Types.ObjectId(cancelledBy),
                cancellationReason: reason,
            },
            { new: true },
        )
    }
}
