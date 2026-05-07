import { startAppointmentCron } from './appointment.cron'

export const initializeCrons = () => {
    startAppointmentCron()
}
