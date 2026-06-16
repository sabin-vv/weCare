import cron from 'node-cron'
import { container } from 'tsyringe'

import { VitalService } from '../../modules/vital/service/vital.service'
import { logger } from '../logger/logger'

export const startVitalMissedCron = () => {
    cron.schedule('*/10 * * * *', async () => {
        try {
            const vitalService = container.resolve(VitalService)
            const result = await vitalService.markOverdueVitalsAsMissed()
            logger.info({ result }, 'Vital missed processing completed')
        } catch (error) {
            console.error('[VitalMissedCron] Error processing missed vitals:', error)
        }
    })
}
