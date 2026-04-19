import { CalendarDays, Clock3 } from 'lucide-react'
import { useState } from 'react'

import { DateRangePicker } from '../components/DateRangePicker'
import { DayScheduleRow } from '../components/DayScheduleRow'
import { SlotDurationSelector } from '../components/SlotDurationSelector'
import { initialSchedule, type WeeklySchedule } from '../types/doctor.types'

import styles from './AvailabilityPage.module.css'

import DoctorLayout from '@/layout/DoctorLayout'
import PageHeader from '@/shared/components/PageHeader/PageHeader'
import ToggleSwitch from '@/shared/components/ToggleSwitch/ToggleSwitch'

const addMinutesToTime = (time: string, minutesToAdd: number) => {
    const [hours, minutes] = time.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + minutesToAdd
    const normalizedMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
    const nextHours = Math.floor(normalizedMinutes / 60)
    const nextMinutes = normalizedMinutes % 60

    return `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`
}

const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
}

const syncScheduleToDuration = (value: WeeklySchedule[], duration: number) =>
    value.map((day) => ({
        ...day,
        timeRanges: day.timeRanges.map((range) => ({
            ...range,
            endTime: addMinutesToTime(range.startTime, duration),
        })),
    }))

const cloneSchedule = (value: WeeklySchedule[]) =>
    value.map((day) => ({ ...day, timeRanges: day.timeRanges.map((range) => ({ ...range })) }))

const defaultSlotDuration = 15
const defaultSchedule = syncScheduleToDuration(cloneSchedule(initialSchedule), defaultSlotDuration)
const defaultDateRange = { start: '', end: '' }

const AvailabilityPage = () => {
    const [slotDuration, setSlotDuration] = useState(defaultSlotDuration)
    const [autoRepeat, setAutoRepeat] = useState(true)
    const [schedule, setSchedule] = useState<WeeklySchedule[]>(cloneSchedule(defaultSchedule))
    const [dateRange, setDateRange] = useState(defaultDateRange)

    const updateDay = (index: number, updater: (day: WeeklySchedule) => WeeklySchedule) => {
        setSchedule((current) => current.map((day, dayIndex) => (dayIndex === index ? updater(day) : day)))
    }

    const handleReset = () => {
        setSlotDuration(defaultSlotDuration)
        setAutoRepeat(true)
        setSchedule(cloneSchedule(defaultSchedule))
        setDateRange(defaultDateRange)
    }

    const handleSlotDurationChange = (duration: number) => {
        setSlotDuration(duration)
        setSchedule((current) => syncScheduleToDuration(current, duration))
    }

    return (
        <DoctorLayout>
            <div className={styles.page}>
                <div className={styles.content}>
                    <PageHeader
                        title="Set Weekly Availability"
                        subtitle="Define your standard working hours and consultation slots for the week."
                    />

                    <div className={styles.form}>
                        <section className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardTitleWrap}>
                                    <div className={styles.iconBadge}>
                                        <Clock3 size={18} />
                                    </div>
                                    <h2 className={styles.cardTitle}>Slot Configuration</h2>
                                </div>
                            </div>

                            <div className={styles.configRow}>
                                <div className={styles.fieldBlock}>
                                    <span className={styles.fieldLabel}>Consultation Duration</span>
                                    <SlotDurationSelector value={slotDuration} onChange={handleSlotDurationChange} />
                                </div>

                                <div className={styles.repeatWrap}>
                                    <div className={styles.repeatText}>
                                        <span className={styles.repeatTitle}>Auto-repeat schedule</span>
                                        <span className={styles.repeatHint}>
                                            Apply recurring availability every week
                                        </span>
                                    </div>
                                    <ToggleSwitch checked={autoRepeat} onChange={setAutoRepeat} />
                                </div>
                            </div>
                        </section>

                        <section className={styles.card}>
                            <div className={styles.scheduleHeader}>
                                <div className={styles.cardTitleWrap}>
                                    <div className={styles.iconBadge}>
                                        <CalendarDays size={18} />
                                    </div>
                                    <h2 className={styles.cardTitle}>Weekly Schedule</h2>
                                </div>

                                <DateRangePicker value={dateRange} onChange={setDateRange} />
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
                                                    currentDay.timeRanges[currentDay.timeRanges.length - 1]?.endTime ?? '09:00'

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
                        </section>

                        <div className={styles.actions}>
                            <button type="button" className={styles.secondaryButton} onClick={handleReset}>
                                Cancel
                            </button>
                            <button type="button" className={styles.primaryButton}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DoctorLayout>
    )
}
export default AvailabilityPage
