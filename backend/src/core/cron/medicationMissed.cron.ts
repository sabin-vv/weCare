import cron from 'node-cron'
import { container } from 'tsyringe'

import { MedicationService } from '../../modules/medication/service/medication.service'

export const startMedicationMissedCron = () => {
    cron.schedule('*/10 * * * *', async () => {
        try {
            const medicationService = container.resolve(MedicationService)
            await medicationService.markOverdueMedicationsAsMissed()
        } catch (error) {
            console.error('[MedicationMissedCron] Error processing missed medications:', error)
        }
    })
}
