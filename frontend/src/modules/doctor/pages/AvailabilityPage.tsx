import { CalendarDays } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getDoctorAvailability, updateDoctorAvailability } from '../api/doctor.api'
import { DayScheduleRow } from '../components/DayScheduleRow'
import { SlotDurationSelector } from '../components/SlotDurationSelector'
import { type DoctorAvailability, type WeeklySchedule } from '../types/doctor.types'
import { validateDoctorAvailability } from '../validator/availabilityValidation'

import styles from './AvailabilityPage.module.css'

import DateRangePicker from '@/shared/components/DateRangePicker/DateRangePicker'
import MainWrapper from '@/shared/components/MainWrapper/MainWrapper'
import { Section } from '@/shared/components/Section/Section'
import { getErrorMessage } from '@/utils/getErrorMessage'

export const initialSchedule: WeeklySchedule[] = [
    { day: 'monday', isAvailable: false, timeRanges: [] },
    { day: 'tuesday', isAvailable: false, timeRanges: [] },
    { day: 'wednesday', isAvailable: false, timeRanges: [] },
    { day: 'thursday', isAvailable: false, timeRanges: [] },
    { day: 'friday', isAvailable: false, timeRanges: [] },
    { day: 'saturday', isAvailable: false, timeRanges: [] },
    { day: 'sunday', isAvailable: false, timeRanges: [] },
]

const addMinutesToTime = (time: string, minutesToAdd: number) => {
    if (!time) return '00:00'
    const parts = time.split(':')
    if (parts.length < 2) return '00:00'

    const [hours, minutes] = parts.map(Number)
    const totalMinutes = hours * 60 + minutes + minutesToAdd
    const normalizedMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
    const nextHours = Math.floor(normalizedMinutes / 60)
    const nextMinutes = normalizedMinutes % 60

    return `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`
}

const toMinutes = (time: string) => {
    if (!time) return 0
    const parts = time.split(':')
    if (parts.length < 2) return 0

    const [hours, minutes] = parts.map(Number)
    return hours * 60 + minutes
}

const cloneSchedule = (value: WeeklySchedule[]) =>
    value.map((day) => ({ ...day, timeRanges: day.timeRanges.map((range) => ({ ...range })) }))

const mergeWithDefaultSchedule = (value: WeeklySchedule[]) =>
    initialSchedule.map((defaultDay) => {
        const savedDay = value.find((day) => day.day === defaultDay.day)

        return savedDay
            ? {
                  ...defaultDay,
                  ...savedDay,
                  timeRanges: savedDay.timeRanges.map((range) => ({ ...range })),
              }
            : { ...defaultDay, timeRanges: [] }
    })

const defaultSlotDuration = 15
const defaultSchedule = cloneSchedule(initialSchedule)
const defaultDateRange = { start: '', end: '' }

const AvailabilityPage = () => {
    const [slotDuration, setSlotDuration] = useState(defaultSlotDuration)
    const [schedule, setSchedule] = useState<WeeklySchedule[]>(cloneSchedule(defaultSchedule))
    const [dateRange, setDateRange] = useState(defaultDateRange)
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const updateDay = (index: number, updater: (day: WeeklySchedule) => WeeklySchedule) => {
        setSchedule((current) => current.map((day, dayIndex) => (dayIndex === index ? updater(day) : day)))
    }

    const handleReset = () => {
        setSlotDuration(defaultSlotDuration)
        setSchedule(cloneSchedule(defaultSchedule))
        setDateRange(defaultDateRange)
    }

    const handleSlotDurationChange = (duration: number) => {
        setSlotDuration(duration)
    }

    useEffect(() => {
        const loadAvailability = async () => {
            try {
                const availability = await getDoctorAvailability()
                setSlotDuration(availability.slotDuration || defaultSlotDuration)
                setSchedule(mergeWithDefaultSchedule(availability.weeklySchedule || []))
                setDateRange({
                    start: availability.startDate || '',
                    end: availability.endDate || '',
                })
            } catch (error) {
                toast.error(getErrorMessage(error))
            } finally {
                setIsLoadingAvailability(false)
            }
        }

        loadAvailability()
    }, [])

    const handleSave = async () => {
        const availabilityData: DoctorAvailability = {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            weeklySchedule: schedule,
            slotDuration,
            startDate: dateRange.start,
            endDate: dateRange.end,
        }

        const validation = validateDoctorAvailability(availabilityData, slotDuration)

        if (!validation.valid) {
            validation.errors.forEach((err) => toast.error(err.message))
            return
        }

        setIsSaving(true)

        try {
            const updatedAvailability = await updateDoctorAvailability(availabilityData)

            setSlotDuration(updatedAvailability.availability.slotDuration)
            setSchedule(cloneSchedule(updatedAvailability.availability.weeklySchedule))
            setDateRange({
                start: updatedAvailability.availability.startDate,
                end: updatedAvailability.availability.endDate,
            })
            if (updatedAvailability.cancelledCount > 0) {
                toast.success(
                    `Availability saved. ${updatedAvailability.cancelledCount} appointment(s) were cancelled.`,
                )
            } else {
                toast.success('Availability saved successfully')
            }

            if (updatedAvailability.notificationFailures.length > 0) {
                toast.error(
                    `${updatedAvailability.notificationFailures.length} notification(s) could not be delivered.`,
                )
            }
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <MainWrapper
            title="Set Weekly Availability"
            subtitle="Define your standard working hours and consultation slots for the week."
        >
            <div className={styles.content}>
                {isLoadingAvailability ? (
                    <div className={styles.loadingCard}>
                        <p className={styles.loadingText}>Loading availability...</p>
                    </div>
                ) : (
                    <div className={styles.form}>
                        <Section
                            title="Weekly Schedule"
                            icon={<CalendarDays size={18} />}
                            actions={<DateRangePicker value={dateRange} onChange={setDateRange} />}
                        >
                            <div className={styles.fieldBlock}>
                                <span className={styles.fieldLabel}>Consultation Duration</span>
                                <SlotDurationSelector value={slotDuration} onChange={handleSlotDurationChange} />
                            </div>

                            <div className={styles.daysList}>
                                {schedule.map((day, index) => (
                                    <DayScheduleRow
                                        key={day.day}
                                        data={day}
                                        slotDuration={slotDuration}
                                        canAddRange={
                                            day.timeRanges.length === 0 ||
                                            toMinutes(day.timeRanges[day.timeRanges.length - 1].endTime) < 23 * 60 + 45
                                        }
                                        onToggleAvailability={(value) =>
                                            updateDay(index, (currentDay) => ({
                                                ...currentDay,
                                                isAvailable: value,
                                                timeRanges:
                                                    value && currentDay.timeRanges.length === 0
                                                        ? [
                                                              {
                                                                  startTime: '09:00',
                                                                  endTime: addMinutesToTime('09:00', slotDuration),
                                                              },
                                                          ]
                                                        : currentDay.timeRanges,
                                            }))
                                        }
                                        onRangeChange={(rangeIndex, value) =>
                                            updateDay(index, (currentDay) => ({
                                                ...currentDay,
                                                timeRanges: currentDay.timeRanges.map((range, currentRangeIndex) =>
                                                    currentRangeIndex === rangeIndex ? value : range,
                                                ),
                                            }))
                                        }
                                        onAddRange={() =>
                                            updateDay(index, (currentDay) => {
                                                const previousEndTime =
                                                    currentDay.timeRanges[currentDay.timeRanges.length - 1]?.endTime ??
                                                    '09:00'

                                                if (toMinutes(previousEndTime) >= 23 * 60 + 45) {
                                                    return currentDay
                                                }

                                                return {
                                                    ...currentDay,
                                                    timeRanges: [
                                                        ...currentDay.timeRanges,
                                                        {
                                                            startTime: previousEndTime,
                                                            endTime: addMinutesToTime(previousEndTime, slotDuration),
                                                        },
                                                    ],
                                                }
                                            })
                                        }
                                        onDeleteRange={(rangeIndex) =>
                                            updateDay(index, (currentDay) => {
                                                const nextRanges = currentDay.timeRanges.filter(
                                                    (_, currentRangeIndex) => currentRangeIndex !== rangeIndex,
                                                )

                                                return {
                                                    ...currentDay,
                                                    isAvailable: nextRanges.length > 0,
                                                    timeRanges: nextRanges,
                                                }
                                            })
                                        }
                                    />
                                ))}
                            </div>
                        </Section>

                        <div className={styles.actions}>
                            <button type="button" className={styles.secondaryButton} onClick={handleReset}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={handleSave}
                                disabled={isSaving || isLoadingAvailability}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </MainWrapper>
    )
}
export default AvailabilityPage
