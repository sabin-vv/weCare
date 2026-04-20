import type { TimeRange, WeeklySchedule, DoctorAvailability, WeekDay } from '../types/doctor.types'

export interface ValidationError {
    field: string
    message: string
}

export interface ValidationResult {
    valid: boolean
    errors: ValidationError[]
}

const toMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
}

const isValidTimeFormat = (time: string): boolean => {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(time)
}

const validateTimeRange = (range: TimeRange, dayName: string): ValidationError | null => {
    if (!isValidTimeFormat(range.startTime)) {
        return { field: `${dayName}.startTime`, message: 'Invalid time format' }
    }
    if (!isValidTimeFormat(range.endTime)) {
        return { field: `${dayName}.endTime`, message: 'Invalid time format' }
    }

    const startMinutes = toMinutes(range.startTime)
    const endMinutes = toMinutes(range.endTime)

    if (endMinutes <= startMinutes) {
        return { field: `${dayName}.endTime`, message: 'End time must be after start time' }
    }

    return null
}

const hasOverlappingRanges = (ranges: TimeRange[]): boolean => {
    const sorted = [...ranges].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))

    for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1]
        const curr = sorted[i]
        if (toMinutes(curr.startTime) < toMinutes(prev.endTime)) {
            return true
        }
    }
    return false
}

export const validateDaySchedule = (
    day: WeeklySchedule,
    slotDuration: number,
): ValidationError[] => {
    const errors: ValidationError[] = []
    const dayName = day.day.charAt(0).toUpperCase() + day.day.slice(1)

    if (!day.isAvailable && day.timeRanges.length > 0) {
        errors.push({
            field: `${dayName}.timeRanges`,
            message: 'Inactive days cannot have time ranges',
        })
    }

    if (day.isAvailable && day.timeRanges.length === 0) {
        errors.push({
            field: `${dayName}.timeRanges`,
            message: `${dayName} must have at least one time range`,
        })
    }

    for (let i = 0; i < day.timeRanges.length; i++) {
        const rangeError = validateTimeRange(day.timeRanges[i], `${dayName}[${i}]`)
        if (rangeError) {
            errors.push(rangeError)
        }

        const duration = toMinutes(day.timeRanges[i].endTime) - toMinutes(day.timeRanges[i].startTime)
        if (duration % slotDuration !== 0) {
            errors.push({
                field: `${dayName}[${i}].duration`,
                message: `${dayName} time range duration must align with slot duration (${slotDuration}min)`,
            })
        }
    }

    if (day.timeRanges.length > 1 && hasOverlappingRanges(day.timeRanges)) {
        errors.push({
            field: `${dayName}.timeRanges`,
            message: `${dayName} has overlapping time ranges`,
        })
    }

    return errors
}

export const validateDateRange = (startDate: string, endDate: string): ValidationError | null => {
    if (!startDate) {
        return { field: 'startDate', message: 'Start date is required' }
    }
    if (!endDate) {
        return { field: 'endDate', message: 'End date is required' }
    }
    if (endDate < startDate) {
        return { field: 'endDate', message: 'End date must be after start date' }
    }
    return null
}

export const validateDoctorAvailability = (
    data: DoctorAvailability,
    slotDuration: number,
): ValidationResult => {
    const errors: ValidationError[] = []

    const days: WeekDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const providedDays = data.weeklySchedule.map((d) => d.day)
    const uniqueDays = new Set(providedDays)

    if (uniqueDays.size !== 7 || !days.every((d) => uniqueDays.has(d))) {
        errors.push({
            field: 'weeklySchedule',
            message: 'Weekly schedule must include all 7 days',
        })
    }

    for (const day of data.weeklySchedule) {
        const dayErrors = validateDaySchedule(day, slotDuration)
        errors.push(...dayErrors)
    }

    const dateError = validateDateRange(data.startDate, data.endDate)
    if (dateError) {
        errors.push(dateError)
    }

    if (![15, 30, 45, 60].includes(slotDuration)) {
        errors.push({
            field: 'slotDuration',
            message: 'Slot duration must be 15, 30, 45, or 60 minutes',
        })
    }

    if (!data.timezone) {
        errors.push({
            field: 'timezone',
            message: 'Timezone is required',
        })
    }

    return {
        valid: errors.length === 0,
        errors,
    }
}