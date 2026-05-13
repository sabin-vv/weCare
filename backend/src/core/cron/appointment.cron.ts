import cron from 'node-cron'

import { AppointmentModel } from '../../modules/appointment/models/appointment.model'

export const startAppointmentCron = () => {
    cron.schedule('*/5 * * * *', async () => {
        try {
            const now = new Date()

            const appointments = await AppointmentModel.find({
                status: { $in: ['confirmed', 'pending_payment'] },
            }).lean()

            const missedIds: string[] = []
            const cancelledIds: string[] = []

            for (const apt of appointments) {
                const [hours, minutes] = apt.slotEnd.split(':').map(Number)
                const slotEndTime = new Date(apt.appointmentDate)
                slotEndTime.setHours(hours, minutes, 0, 0)

                if (slotEndTime < now) {
                    if (apt.status === 'confirmed') {
                        missedIds.push(apt._id.toString())
                    } else if (apt.status === 'pending_payment') {
                        cancelledIds.push(apt._id.toString())
                    }
                }
            }

            if (missedIds.length > 0) {
                await AppointmentModel.updateMany(
                    { _id: { $in: missedIds } },
                    { $set: { status: 'missed', missedAt: now } },
                )
            }

            if (cancelledIds.length > 0) {
                await AppointmentModel.updateMany(
                    { _id: { $in: cancelledIds } },
                    {
                        $set: {
                            status: 'cancelled',
                            cancelledAt: now,
                            cancellationReason: 'Payment not completed within slot time',
                        },
                    },
                )
            }
        } catch (error) {
            console.error('Appointment cron failed:', error)
        }
    })
}
