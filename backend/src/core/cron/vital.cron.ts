import cron from 'node-cron'
import { container } from 'tsyringe'

import { VitalService } from '../../modules/vital/service/vital.service'

export const startVitalCron = () => {
    cron.schedule('59 23 * * *', async () => {
        try {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const vitalService = container.resolve(VitalService)
            await vitalService.generateDailyVitalSchedule(today)
        } catch (error) {
            console.error('Vital cron failed:', error)
        }
    })
}
