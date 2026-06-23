import { startAppointmentCron } from './appointment.cron'
import { startMedicationCron } from './medication.cron'
import { startMedicationMissedCron } from './medicationMissed.cron'
import { startPrescriptionCron } from './prescription.cron'
import { startVitalCron } from './vital.cron'
import { startVitalMissedCron } from './vitalMissed.cron'

export const initializeCrons = () => {
    startAppointmentCron()
    startMedicationCron()
    startMedicationMissedCron()
    startPrescriptionCron()
    startVitalCron()
    startVitalMissedCron()
}
