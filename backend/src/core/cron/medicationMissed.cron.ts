import cron from 'node-cron'
import { container } from 'tsyringe'

import { MedicationService } from '../../modules/medication/service/medication.service'
import { VitalService } from '../../modules/vital/service/vital.service'

export const startMedicationMissedCron = () => {
    cron.schedule('*/10 * * * *', async () => {
        try {
            const medicationService = container.resolve(MedicationService)
            await medicationService.markOverdueMedicationsAsMissed()

            const vitalService = container.resolve(VitalService)
            await vitalService.markOverdueVitalsAsMissed()
        } catch (error) {
            console.error('[MissedCron] Error processing missed schedules:', error)
        }
    })
}
