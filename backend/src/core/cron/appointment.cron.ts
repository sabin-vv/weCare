import cron from 'node-cron'

import { AppointmentModel } from '../../modules/appointment/models/appointment.model'
import { ActivityLogModel } from '../../modules/activityLog/models/activityLog.model'

export const startAppointmentCron = () => {
    cron.schedule('*/5 * * * *', async () => {
        try {
            const now = new Date()

            const appointments = await AppointmentModel.find({
                status: { $in: ['confirmed', 'pending_payment'] },
            }).lean()

            const missedIds: string[] = []
            const cancelledIds: string[] = []
            const cancelledAppointments: Array<{ id: string; appointmentId: string; patientId: string }> = []

            for (const apt of appointments) {
                const [hours, minutes] = apt.slotEnd.split(':').map(Number)
                const slotEndTime = new Date(apt.appointmentDate)
                slotEndTime.setHours(hours, minutes, 0, 0)

                if (slotEndTime < now) {
                    if (apt.status === 'confirmed') {
                        missedIds.push(apt._id.toString())
                    } else if (apt.status === 'pending_payment') {
                        cancelledIds.push(apt._id.toString())
                        cancelledAppointments.push({
                            id: apt._id.toString(),
                            appointmentId: (apt as any).appointmentId?.toString() || apt._id.toString(),
                            patientId: apt.patientId?.toString() || '',
                        })
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

                const logs = cancelledAppointments.flatMap((apt) => [
                    {
                        performedBy: apt.patientId,
                        performedByRole: 'patient' as const,
                        category: 'appointment' as const,
                        action: 'appointment_cancelled' as const,
                        targetId: apt.id,
                        targetType: 'appointment' as const,
                        description: `Auto-cancelled — Payment not completed (Appointment ID: ${apt.appointmentId})`,
                    },
                    {
                        performedBy: apt.patientId,
                        performedByRole: 'patient' as const,
                        category: 'payment' as const,
                        action: 'payment_failed' as const,
                        targetId: apt.id,
                        targetType: 'appointment' as const,
                        description: `Payment failed for appointment (Appointment ID: ${apt.appointmentId})`,
                    },
                ])

                if (logs.length > 0) {
                    await ActivityLogModel.insertMany(logs)
                }
            }
        } catch (error) {
            console.error('Appointment cron failed:', error)
        }
    })
}
