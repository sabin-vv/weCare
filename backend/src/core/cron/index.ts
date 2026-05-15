import { startAppointmentCron } from './appointment.cron'
import { startMedicationCron } from './medication.cron'
import { startMedicationMissedCron } from './medicationMissed.cron'
import { startVitalCron } from './vital.cron'

export const initializeCrons = () => {
    startAppointmentCron()
    startMedicationCron()
    startMedicationMissedCron()
    startVitalCron()
}
