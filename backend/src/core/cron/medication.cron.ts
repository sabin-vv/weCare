import cron from 'node-cron'
import { container } from 'tsyringe'

import { logger } from '../../core/logger/logger'
import { MedicationService } from '../../modules/medication/service/medication.service'

export const startMedicationCron = () => {
    cron.schedule('59 23 * * *', async () => {
        try {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const medicationService = container.resolve(MedicationService)
            const result = await medicationService.generateDailySchedule(today)
            logger.info({ result }, 'Medication daily schedule cron completed')
        } catch (error) {
            logger.error(error, 'Medication cron failed')
        }
    })
}
