import { AppointmentDocument } from '../../appointment/types/appointment.types'
import { DoctorAvailabilityDocument, DoctorSlotsResponse, WeeklySchedule } from '../types/doctor.types'

const toMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
}

const fromMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

const generateSlots = (
    schedule: WeeklySchedule,
    slotDuration: number,
    appointments: AppointmentDocument[],
): DoctorSlotsResponse['slots'] => {
    if (!schedule.isAvailable || schedule.timeRanges.length === 0) {
        return []
    }

    const slots: DoctorSlotsResponse['slots'] = []
    const now = new Date()
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000)

    for (const range of schedule.timeRanges) {
        let currentMinutes = toMinutes(range.startTime)
        const endMinutes = toMinutes(range.endTime)

        while (currentMinutes + slotDuration <= endMinutes) {
            const start = fromMinutes(currentMinutes)
            const isBooked = appointments.some((app) => {
                if (app.slotStart !== start) return false

                if (app.status === 'confirmed') return true

                if (app.status === 'pending_payment') {
                    return new Date(app.createdAt) > fifteenMinutesAgo
                }

                return false
            })

            slots.push({
                start,
                end: fromMinutes(currentMinutes + slotDuration),
                available: !isBooked,
            })
            currentMinutes += slotDuration
        }
    }

    return slots
}

export const toDoctorSlotsResponse = (
    doctorId: string,
    date: string,
    availability: DoctorAvailabilityDocument | null,
    appointments: AppointmentDocument[] = [],
): DoctorSlotsResponse => {
    const dayOfWeek = new Date(date)
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase() as WeeklySchedule['day']

    const schedule = availability?.weeklySchedule.find((s) => s.day === dayOfWeek) || {
        day: dayOfWeek,
        isAvailable: false,
        timeRanges: [],
    }

    const slotDuration = availability?.slotDuration || 15

    const slots = generateSlots(schedule, slotDuration, appointments)

    return {
        doctorId,
        date,
        timezone: availability?.timezone || 'UTC',
        slotDuration,
        slots,
    }
}
