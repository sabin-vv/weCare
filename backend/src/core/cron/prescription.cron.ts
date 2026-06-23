import cron from 'node-cron'

import { PrescriptionModel } from '../../modules/prescription/models/prescription.model'
import { logger } from '../logger/logger'

export const startPrescriptionCron = () => {
    cron.schedule('1 0 * * *', async () => {
        try {
            const todayStart = new Date()
            todayStart.setHours(0, 0, 0, 0)

            const result = await PrescriptionModel.updateMany(
                { status: 'active', endDate: { $lte: todayStart } },
                { $set: { status: 'completed' } },
            )

            if (result.modifiedCount > 0) {
                logger.info({ result }, 'Prescription completion cron processed')
            }
        } catch (error) {
            logger.error(error, 'Prescription cron failed')
        }
    })
}
