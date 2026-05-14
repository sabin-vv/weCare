import { startAppointmentCron } from './appointment.cron'
import { startMedicationCron } from './medication.cron'
import { startVitalCron } from './vital.cron'

export const initializeCrons = () => {
    startAppointmentCron()
    startMedicationCron()
    startVitalCron()
}
