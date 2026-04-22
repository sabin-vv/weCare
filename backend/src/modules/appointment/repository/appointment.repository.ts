import { singleton } from 'tsyringe'
import { AppointmentModel } from '../models/appointment.model'
import { AppointmentDocument } from '../types/appointment.types'

@singleton()
export class AppointmentRepository {
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
        return await AppointmentModel.findByIdAndUpdate(id, data, { new: true })
    }

    async findByPatientId(patientId: string): Promise<AppointmentDocument[]> {
        return await AppointmentModel.find({ patientId })
            .populate('doctorId', 'name email')
            .sort({ appointmentDate: -1, slotStart: -1 })
    }

    async findByDoctorId(doctorId: string): Promise<AppointmentDocument[]> {
        return await AppointmentModel.find({ doctorId })
            .populate('patientId', 'name email')
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
            status: { $in: ['confirmed', 'pending'] },
        })
    }
}
