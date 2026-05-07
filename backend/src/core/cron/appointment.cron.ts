import cron from 'node-cron'

import { AppointmentModel } from '../../modules/appointment/models/appointment.model'

export const startAppointmentCron = () => {
    cron.schedule('*/30 * * * *', async () => {
        try {
            const now = new Date()
            await AppointmentModel.updateMany(
                {
                    appointmentDate: { $lt: now },
                    status: 'confirmed',
                },
                {
                    $set: {
                        status: 'cancelled',
                    },
                },
            )
        } catch (error) {
            console.error('Appointment cron failed:', error)
        }
    })
}
