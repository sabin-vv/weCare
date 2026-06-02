import { Bell, CheckCheck, CheckCircle2, Clock, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { createReminder, deleteReminder, getMyPatients, getReminders, markReminderDone } from '../api/caregiver.api'
import type { CreateReminderDTO, PatientOption, ReminderItem, RemindersResponse } from '../types/caregiver.types'

import styles from './CaregiverReminders.module.css'

import InputField from '@/shared/components/InputField/InputField'
import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import Modal from '@/shared/components/Modal/Modal'
import { getErrorMessage } from '@/utils/getErrorMessage'

const priorityLabels: Record<string, string> = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
}

const priorityOptions: { value: 'low' | 'medium' | 'high'; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
]

const CaregiverReminders = () => {
    const [data, setData] = useState<RemindersResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const [patients, setPatients] = useState<PatientOption[]>([])
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [createForm, setCreateForm] = useState<CreateReminderDTO>({
        title: '',
        scheduleTime: '',
        priority: 'medium',
    })

    const fetchData = async () => {
        try {
            const [result, patientList] = await Promise.all([getReminders(), getMyPatients()])
            setData(result)
            setPatients(patientList)
            if (patientList.length === 1) {
                const pid = patientList[0]._id
                setCreateForm((f) => (f.patientId ? f : { ...f, patientId: pid }))
            }
        } catch (err) {
            toast.error(getErrorMessage(err))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const formatTime = (isoString: string) => {
        const date = new Date(isoString)
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    }

    const formatDate = (isoString: string) => {
        const today = new Date()
        const date = new Date(isoString)
        const diffTime = date.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 0) return `Overdue (${Math.abs(diffDays)}d)`
        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Tomorrow'
        if (diffDays <= 7) return `${diffDays} days away`
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const handleCreate = async () => {
        if (!createForm.title.trim()) {
            toast.error('Title is required')
            return
        }
        if (!createForm.scheduleTime) {
            toast.error('Date & time is required')
            return
        }

        try {
            setIsSaving(true)
            await createReminder({
                ...createForm,
                scheduleTime: new Date(createForm.scheduleTime).toISOString(),
            })
            toast.success('Reminder created')
            setCreateForm((current) => ({
                patientId: current.patientId,
                title: '',
                description: '',
                scheduleTime: '',
                priority: 'medium',
            }))
            await fetchData()
            setIsCreateModalOpen(false)
        } catch (err) {
            toast.error(getErrorMessage(err))
        } finally {
            setIsSaving(false)
        }
    }

    const handleMarkDone = async (reminderId: string) => {
        try {
            await markReminderDone(reminderId)
            toast.success('Reminder completed')
            await fetchData()
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const handleDelete = async (reminderId: string) => {
        try {
            await deleteReminder(reminderId)
            toast.success('Reminder deleted')
            await fetchData()
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const sorted: ReminderItem[] = data
        ? [...data.reminders].sort((a, b) => new Date(a.scheduleTime).getTime() - new Date(b.scheduleTime).getTime())
        : []

    const createReminderForm = (
        <div className={styles.modalBody}>
            {patients.length === 1 && <InputField label="Patient" value={patients[0].userName} readOnly />}

            <InputField
                label="Title *"
                value={createForm.title}
                placeholder="Type reminder title"
                onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
            />

            <label className={styles.textareaField}>
                <span className={styles.modalLabel}>Description</span>
                <textarea
                    className={styles.modalTextarea}
                    value={createForm.description ?? ''}
                    placeholder="Optional note"
                    onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                />
            </label>

            <InputField
                label="Date & time *"
                type="datetime-local"
                value={createForm.scheduleTime}
                onChange={(e) => setCreateForm((f) => ({ ...f, scheduleTime: e.target.value }))}
            />

            <span className={styles.modalLabel}>Priority</span>
            <div className={styles.priorityRow}>
                {priorityOptions.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        className={`${styles.priorityBtn} ${createForm.priority === opt.value ? styles.priorityBtnActive : ''}`}
                        onClick={() => setCreateForm((f) => ({ ...f, priority: opt.value }))}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    )

    if (isLoading) {
        return (
            <MainWrapper>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner} />
                </div>
            </MainWrapper>
        )
    }

    return (
        <MainWrapper title="Reminders">
            <section className={styles.page}>
                <div className={styles.pageHeader}>
                    <div>
                        <h2 className={styles.pageTitle}>Care tasks</h2>
                    </div>
                    <button type="button" className={styles.createBtn} onClick={() => setIsCreateModalOpen(true)}>
                        <Plus size={16} />
                        Create
                    </button>
                </div>

                <div className={styles.pageInner}>
                    <div className={styles.mainContent}>
                        {data && (
                            <>
                                <div className={styles.statsRow}>
                                    <div className={styles.statCard}>
                                        <div className={`${styles.statIcon} ${styles.statIconTotal}`}>
                                            <Bell size={20} />
                                        </div>
                                        <div className={styles.statInfo}>
                                            <span className={styles.statValue}>{data.total}</span>
                                            <span className={styles.statLabel}>Total</span>
                                        </div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={`${styles.statIcon} ${styles.statIconPending}`}>
                                            <Clock size={20} />
                                        </div>
                                        <div className={styles.statInfo}>
                                            <span className={styles.statValue}>{data.pendingCount}</span>
                                            <span className={styles.statLabel}>Pending</span>
                                        </div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={`${styles.statIcon} ${styles.statIconTotal}`}>
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <div className={styles.statInfo}>
                                            <span className={styles.statValue}>{data.completedCount}</span>
                                            <span className={styles.statLabel}>Completed</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>
                                        {sorted.length > 0 ? `Reminders (${sorted.length})` : 'No Reminders'}
                                    </h3>

                                    {sorted.length === 0 ? (
                                        <div className={styles.emptyState}>
                                            <div className={styles.emptyIcon}>
                                                <CheckCircle2 size={48} />
                                            </div>
                                            <p className={styles.emptyText}>All caught up! No reminders.</p>
                                        </div>
                                    ) : (
                                        sorted.map((reminder) => (
                                            <article key={reminder._id} className={styles.reminderCard}>
                                                <div className={styles.reminderLeft}>
                                                    <span
                                                        className={`${styles.reminderBadge} ${reminder.status === 'missed' ? styles.reminderBadgeMissed : reminder.status === 'completed' ? styles.reminderBadgeCompleted : styles.reminderBadgePending}`}
                                                    />
                                                    <div className={styles.reminderTime}>
                                                        <span className={styles.reminderTimeValue}>
                                                            {formatTime(reminder.scheduleTime)}
                                                        </span>
                                                        <span className={styles.reminderDateLabel}>
                                                            {formatDate(reminder.scheduleTime)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={styles.reminderBody}>
                                                    <h4 className={styles.reminderTitle}>{reminder.title}</h4>
                                                    {reminder.description && (
                                                        <span className={styles.reminderSub}>
                                                            {reminder.description}
                                                        </span>
                                                    )}
                                                    <div className={styles.reminderMeta}>
                                                        {reminder.patientName && (
                                                            <>
                                                                <span className={styles.patientNameLabel}>
                                                                    {reminder.patientName}
                                                                </span>
                                                                <span>·</span>
                                                            </>
                                                        )}
                                                        <span
                                                            className={`${styles.priorityBadge} ${styles[`priority${priorityLabels[reminder.priority]}`]}`}
                                                        >
                                                            {priorityLabels[reminder.priority]}
                                                        </span>
                                                        <span>·</span>
                                                        <span
                                                            className={`${styles.statusLabel} ${reminder.status === 'missed' ? styles.statusMissed : reminder.status === 'completed' ? styles.statusCompleted : styles.statusPending}`}
                                                        >
                                                            {reminder.status.charAt(0).toUpperCase() +
                                                                reminder.status.slice(1)}
                                                        </span>
                                                        <span>·</span>
                                                        <span className={styles.sourceLabel}>{reminder.source}</span>
                                                    </div>
                                                </div>
                                                <div className={styles.reminderActions}>
                                                    {reminder.source === 'custom' && reminder.status === 'pending' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className={styles.actionBtn}
                                                                onClick={() => handleMarkDone(reminder._id)}
                                                                title="Mark as done"
                                                            >
                                                                <CheckCheck size={16} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={styles.actionBtnDanger}
                                                                onClick={() => handleDelete(reminder._id)}
                                                                title="Delete reminder"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </article>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create Reminder"
                size="sm"
                footer={
                    <>
                        <button
                            type="button"
                            className={styles.modalCancelBtn}
                            onClick={() => setIsCreateModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className={styles.modalSaveBtn}
                            disabled={!createForm.title.trim() || !createForm.scheduleTime || isSaving}
                            onClick={handleCreate}
                        >
                            {isSaving ? 'Saving...' : 'Create'}
                        </button>
                    </>
                }
            >
                {createReminderForm}
            </Modal>
        </MainWrapper>
    )
}

export default CaregiverReminders
