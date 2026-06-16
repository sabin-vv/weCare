import cron from 'node-cron'
import { container } from 'tsyringe'

import { VitalService } from '../../modules/vital/service/vital.service'
import { logger } from '../logger/logger'

export const startVitalCron = () => {
    cron.schedule('59 23 * * *', async () => {
        try {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const vitalService = container.resolve(VitalService)
            const result = await vitalService.generateDailyVitalSchedule(today)
            logger.info({ result }, 'Vital daily schedule cron completed')
        } catch (error) {
            console.error('Vital cron failed:', error)
        }
    })
}
