import { Activity, ClipboardPlus, Pill, Siren, Stethoscope } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getCaregiverActivityLogs } from '../api/caregiver.api'
import type { CaregiverActivityLogItem, CaregiverActivityType } from '../types/caregiver.types'

import styles from './CaregiverActivityLog.module.css'

import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import { getErrorMessage } from '@/utils/getErrorMessage'

const activityMeta: Record<
    CaregiverActivityType,
    {
        label: string
        badge: string
        Icon: typeof Activity
    }
> = {
    medication_administered: {
        label: 'Medication Log',
        badge: 'completed',
        Icon: Pill,
    },
    medication_missed: {
        label: 'Missed Medication',
        badge: 'critical',
        Icon: Siren,
    },
    vital_recorded: {
        label: 'Vital Recorded',
        badge: 'stable',
        Icon: Stethoscope,
    },
    symptom_logged: {
        label: 'Symptom Logged',
        badge: 'warning',
        Icon: ClipboardPlus,
    },
}

const formatTime = (isoString: string) =>
    new Date(isoString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })

const formatDate = (isoString: string) =>
    new Date(isoString).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })

const splitDescription = (description?: string) => {
    if (!description) return { title: 'Clinical activity', details: '' }

    const parts = description
        .split('|')
        .map((part) => part.trim())
        .filter(Boolean)

    return {
        title: parts[0] ?? description,
        details: parts.slice(1).join(' • '),
    }
}

const CaregiverActivityLog = () => {
    const [activities, setActivities] = useState<CaregiverActivityLogItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchActivityLogs = async () => {
            try {
                const result = await getCaregiverActivityLogs()
                setActivities(result.data)
            } catch (err) {
                toast.error(getErrorMessage(err))
            } finally {
                setIsLoading(false)
            }
        }

        fetchActivityLogs()
    }, [])

    if (isLoading) {
        return (
            <MainWrapper title="Activity Log">
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner} />
                </div>
            </MainWrapper>
        )
    }

    return (
        <MainWrapper title="Activity Log">
            <section className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <span className={styles.eyebrow}>Care History</span>
                    </div>
                    <span className={styles.count}>{activities.length} records</span>
                </div>

                {activities.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Activity size={42} />
                        <p>No activity logs yet.</p>
                    </div>
                ) : (
                    <div className={styles.timeline}>
                        {activities.map((activity) => {
                            const meta = activityMeta[activity.activityType]
                            const Icon = meta.Icon
                            const description = splitDescription(activity.description)

                            return (
                                <article key={activity.id} className={styles.activityCard}>
                                    <div className={styles.timeBlock}>
                                        <strong>{formatTime(activity.createdAt)}</strong>
                                        <span>{formatDate(activity.createdAt)}</span>
                                    </div>

                                    <div className={`${styles.iconWrap} ${styles[meta.badge]}`}>
                                        <Icon size={18} />
                                    </div>

                                    <div className={styles.content}>
                                        <div className={styles.cardTop}>
                                            <span className={styles.activityLabel}>{meta.label}</span>
                                            <span className={`${styles.statusBadge} ${styles[meta.badge]}`}>
                                                {meta.badge}
                                            </span>
                                        </div>

                                        <div className={styles.detailsGrid}>
                                            <div>
                                                <span className={styles.fieldLabel}>Clinical Details</span>
                                                <h3>{description.title}</h3>
                                                {description.details && <p>{description.details}</p>}
                                            </div>
                                            <div>
                                                <span className={styles.fieldLabel}>Patient</span>
                                                <h3>{activity.patientName || 'Unknown patient'}</h3>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                )}
            </section>
        </MainWrapper>
    )
}

export default CaregiverActivityLog
