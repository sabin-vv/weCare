import {
    Activity,
    AlertCircle,
    BadgeAlert,
    CheckCircle2,
    ClipboardPlus,
    Clock3,
    Clock4,
    CircleX,
    Gauge,
    Droplet,
    Heart,
    RefreshCw,
    ShieldAlert,
    Wind,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import {
    getMyPatients,
    getPatientMedications,
    getPatientVitalSchedules,
    logMedicationAction,
    logSymptom,
    logVitalReading,
    type PatientSummary,
} from '../api/caregiver.api'
import ProfileCard from '../components/ProfileCard/ProfileCard'
import type {
    AlertCard,
    MedicationLogFormState,
    MedicationSchedule,
    SymptomLogFormState,
    SymptomSeverity,
    TimelineItem,
    VitalLogFormState,
    VitalScheduleItem,
} from '../types/caregiver.types'

import styles from './CaregiverPatients.module.css'

import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import Modal from '@/shared/components/Modal/Modal'
import { Section } from '@/shared/components/Section/Section'
import { getErrorMessage } from '@/utils/getErrorMessage'

const iconMap: Record<string, typeof Activity> = {
    blood_pressure: Heart,
    blood_sugar: Droplet,
    heart_rate: Activity,
    spo2: Wind,
}

const labelMap: Record<string, string> = {
    blood_pressure: 'Blood Pressure',
    blood_sugar: 'Blood Sugar',
    heart_rate: 'Heart Rate',
    spo2: 'SpO2',
}

const unitMap: Record<string, string> = {
    blood_pressure: 'mmHg',
    blood_sugar: 'mg/dL',
    heart_rate: 'BPM',
    spo2: '%',
}

const toneMeta = {
    critical: {
        alertIcon: AlertCircle,
        sectionIcon: ShieldAlert,
        cardClassName: styles.alertCritical,
        badgeClassName: styles.alertBadgeCritical,
        timelineClassName: styles.timelineCritical,
    },
    warning: {
        alertIcon: Clock3,
        sectionIcon: BadgeAlert,
        cardClassName: styles.alertWarning,
        badgeClassName: styles.alertBadgeWarning,
        timelineClassName: styles.timelineWarning,
    },
    success: {
        alertIcon: ClipboardPlus,
        sectionIcon: ClipboardPlus,
        cardClassName: styles.alertWarning,
        badgeClassName: styles.alertBadgeWarning,
        timelineClassName: styles.timelineSuccess,
    },
} as const

const symptomOptions = [
    'Headache',
    'Dizziness',
    'Nausea',
    'Fatigue',
    'Shortness of breath',
    'Chest pain',
    'Fever',
    'Cough',
]

const formatTime = (isoString: string) =>
    new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

const formatDate = (isoString: string) =>
    new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

const getMedicationStatusMeta = (status: MedicationSchedule['status']) => {
    switch (status) {
        case 'administered':
            return {
                title: 'Medication Administered',
                note: 'Administered',
                tone: 'success' as const,
                actionLabel: 'Administered',
            }
        case 'missed':
            return {
                title: 'Medication Deviation',
                note: 'Missed dose',
                tone: 'critical' as const,
                actionLabel: 'Take Action',
            }
        case 'skipped':
            return {
                title: 'Medication Skipped',
                note: 'Skipped',
                tone: 'warning' as const,
                actionLabel: 'Skipped',
            }
        case 'cancelled':
            return {
                title: 'Medication Cancelled',
                note: 'Cancelled',
                tone: 'warning' as const,
                actionLabel: 'Cancelled',
            }
        default:
            return {
                title: 'Medication Scheduled',
                note: 'Scheduled',
                tone: 'warning' as const,
                actionLabel: 'Take Action',
            }
    }
}

const CaregiverPatients = () => {
    const [patients, setPatients] = useState<PatientSummary[]>([])
    const [medications, setMedications] = useState<MedicationSchedule[]>([])
    const [vitalSchedules, setVitalSchedules] = useState<VitalScheduleItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [selectedMedication, setSelectedMedication] = useState<MedicationSchedule | null>(null)
    const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false)
    const [medicationLogForm, setMedicationLogForm] = useState<MedicationLogFormState>({
        status: 'on_time',
        takenTime: '',
        route: '',
        observations: '',
    })
    const [isVitalModalOpen, setIsVitalModalOpen] = useState(false)
    const [vitalLogForm, setVitalLogForm] = useState<VitalLogFormState>({
        selectedScheduleId: undefined,
        vitalType: '',
        systolic: '',
        diastolic: '',
        value: '',
        recordedAt: '',
        notes: '',
    })
    const [isSymptomModalOpen, setIsSymptomModalOpen] = useState(false)
    const [symptomLogForm, setSymptomLogForm] = useState<SymptomLogFormState>({
        symptom: '',
        onsetTime: '',
        severity: 'mild',
        observations: '',
    })
    const [isSavingMedication, setIsSavingMedication] = useState(false)
    const [isSavingVital, setIsSavingVital] = useState(false)
    const [isSavingSymptom, setIsSavingSymptom] = useState(false)
    const navigate = useNavigate()

    const loadAll = async (showRefreshLoader = false) => {
        try {
            if (showRefreshLoader) setIsRefreshing(true)
            const patientData = await getMyPatients()
            setPatients(patientData)
            if (patientData.length > 0) {
                const [medData, vitalData] = await Promise.all([
                    getPatientMedications(patientData[0]._id),
                    getPatientVitalSchedules(patientData[0]._id),
                ])
                setMedications(medData)
                setVitalSchedules(vitalData)
            }
        } catch (err) {
            console.error('Error fetching data:', err)
            toast.error(getErrorMessage(err))
        } finally {
            setIsLoading(false)
            if (showRefreshLoader) setIsRefreshing(false)
        }
    }

    useEffect(() => {
        loadAll()
    }, [])

    const handleRefresh = () => {
        loadAll(true)
    }

    const now = new Date()
    const alerts: AlertCard[] = medications
        .filter((med) => med.status === 'missed' || (med.status === 'pending' && new Date(med.scheduleTime) < now))
        .map((med) => {
            const time = new Date(med.scheduleTime)
            const timeStr = `${formatDate(med.scheduleTime)}, ${formatTime(med.scheduleTime)}`
            const isOverdue = med.status === 'missed' || time < new Date()
            return {
                id: med._id,
                title: med.status === 'missed' ? 'Missed Dose' : 'Overdue Dose',
                medicine: `${med.medicineName} ${med.dosage}`,
                scheduled: timeStr,
                route: med.route,
                overdue: isOverdue ? 'Needs attention' : '',
                tone: med.status === 'missed' ? 'critical' : 'warning',
            }
        })

    const timeline: TimelineItem[] = [...medications]
        .sort((a, b) => new Date(a.scheduleTime).getTime() - new Date(b.scheduleTime).getTime())
        .map((med) => {
            const statusMeta = getMedicationStatusMeta(med.status)
            return {
                id: med._id,
                time: formatTime(med.scheduleTime),
                title: statusMeta.title,
                medicine: `${med.medicineName} ${med.dosage}`,
                note: statusMeta.note,
                route: med.route,
                tone: statusMeta.tone,
                actionLabel: statusMeta.actionLabel,
            }
        })

    const openMedicationModal = (medication: MedicationSchedule) => {
        const scheduledDate = new Date(medication.scheduleTime)
        const defaultTime = scheduledDate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        })

        setSelectedMedication(medication)
        setMedicationLogForm({
            status: 'on_time',
            takenTime: defaultTime,
            route: medication.route,
            observations: '',
        })
        setIsMedicationModalOpen(true)
    }

    const closeMedicationModal = () => {
        setIsMedicationModalOpen(false)
        setSelectedMedication(null)
    }

    const handleMedicationLogSubmit = async () => {
        if (!selectedMedication || patients.length === 0) return
        const patientId = patients[0]._id

        try {
            setIsSavingMedication(true)
            await logMedicationAction(patientId, selectedMedication._id, {
                status: medicationLogForm.status,
                takenTime: medicationLogForm.takenTime,
                route: medicationLogForm.route,
                observations: medicationLogForm.observations.trim() || undefined,
            })
            await loadAll()
            toast.success(
                medicationLogForm.status === 'skipped' ? 'Medication marked as skipped' : 'Medication log saved',
            )
            closeMedicationModal()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsSavingMedication(false)
        }
    }

    const openVitalModal = (vitalType?: string, schedule?: VitalScheduleItem) => {
        const fallbackType = vitalType || vitalSchedules[0]?.vitalType || 'blood_pressure'
        const now = new Date()
        const defaultTime = now.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        })

        setVitalLogForm({
            selectedScheduleId: schedule?._id,
            vitalType: fallbackType,
            systolic: fallbackType === 'blood_pressure' ? '120' : '',
            diastolic: fallbackType === 'blood_pressure' ? '80' : '',
            value: '',
            recordedAt: defaultTime,
            notes: '',
        })
        setIsVitalModalOpen(true)
    }

    const closeVitalModal = () => {
        setIsVitalModalOpen(false)
    }

    const handleVitalTypeChange = (nextType: string) => {
        setVitalLogForm((current) => ({
            ...current,
            selectedScheduleId: undefined,
            vitalType: nextType,
            systolic: nextType === 'blood_pressure' ? current.systolic || '120' : '',
            diastolic: nextType === 'blood_pressure' ? current.diastolic || '80' : '',
            value: nextType === 'blood_pressure' ? '' : current.value,
        }))
    }

    const handleVitalLogSubmit = async () => {
        if (patients.length === 0) return
        const patientId = patients[0]._id

        try {
            setIsSavingVital(true)
            await logVitalReading(patientId, {
                scheduleId: vitalLogForm.selectedScheduleId,
                vitalType: vitalLogForm.vitalType,
                systolic: isBloodPressure ? Number(vitalLogForm.systolic) : undefined,
                diastolic: isBloodPressure ? Number(vitalLogForm.diastolic) : undefined,
                value: !isBloodPressure && vitalLogForm.value ? Number(vitalLogForm.value) : undefined,
                recordedAt: vitalLogForm.recordedAt,
                notes: vitalLogForm.notes.trim() || undefined,
            })
            await loadAll()
            toast.success('Vital reading logged')
            closeVitalModal()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsSavingVital(false)
        }
    }

    const openSymptomModal = () => {
        const now = new Date()
        const defaultTime = now.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        })

        setSymptomLogForm({
            symptom: symptomOptions[0],
            onsetTime: defaultTime,
            severity: 'mild',
            observations: '',
        })
        setIsSymptomModalOpen(true)
    }

    const closeSymptomModal = () => {
        setIsSymptomModalOpen(false)
    }

    const handleSymptomLogSubmit = async () => {
        if (patients.length === 0) return
        const patientId = patients[0]._id

        try {
            setIsSavingSymptom(true)
            await logSymptom(patientId, {
                symptom: symptomLogForm.symptom,
                onsetTime: symptomLogForm.onsetTime,
                severity: symptomLogForm.severity,
                observations: symptomLogForm.observations.trim() || undefined,
            })
            toast.success('Symptom log saved')
            closeSymptomModal()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsSavingSymptom(false)
        }
    }

    const isBloodPressure = vitalLogForm.vitalType === 'blood_pressure'
    const selectedVitalLabel = labelMap[vitalLogForm.vitalType] || 'Vital'
    const selectedVitalUnit = unitMap[vitalLogForm.vitalType] || ''

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
        <MainWrapper title="My Patients">
            {patients.length === 0 ? (
                <Section>
                    <p className={styles.emptyText}>No patients assigned to you yet.</p>
                </Section>
            ) : (
                <>
                    <ProfileCard
                        patient={patients[0]}
                        action={{
                            label: 'View Prescription',
                            onClick: () => {
                                navigate(`/caregiver/patients/${patients[0]._id}/prescription`)
                            },
                        }}
                    />

                    <Section
                        title="Patient Medication Monitor"
                        actions={
                            <button
                                type="button"
                                className={styles.refreshBtn}
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                            >
                                <RefreshCw size={16} className={isRefreshing ? styles.spinningIcon : ''} />
                                {isRefreshing ? 'Refreshing...' : 'Refresh'}
                            </button>
                        }
                    >
                        {alerts.length > 0 && (
                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <div className={styles.sectionTitleWrap}>
                                        <ShieldAlert size={18} className={styles.sectionIconCritical} />
                                        <h3 className={styles.sectionTitle}>Medication Deviation (Critical Alerts)</h3>
                                    </div>
                                    <span className={styles.sectionMeta}>{alerts.length} alerts</span>
                                </div>

                                <div className={styles.alertGrid}>
                                    {alerts.map((alert) => {
                                        const meta = toneMeta[alert.tone]
                                        const AlertIcon = meta.alertIcon

                                        return (
                                            <article
                                                key={`${alert.medicine}-${alert.scheduled}`}
                                                className={`${styles.alertCard} ${meta.cardClassName}`}
                                            >
                                                <div className={styles.alertTop}>
                                                    <div className={styles.alertTitleWrap}>
                                                        <span className={styles.alertIcon}>
                                                            <AlertIcon size={18} />
                                                        </span>
                                                        <div>
                                                            <p className={styles.alertLabel}>{alert.title}</p>
                                                            <h4 className={styles.alertMedicine}>{alert.medicine}</h4>
                                                        </div>
                                                    </div>
                                                    {alert.overdue && (
                                                        <span className={`${styles.alertBadge} ${meta.badgeClassName}`}>
                                                            {alert.overdue}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className={styles.alertDetails}>
                                                    <div>
                                                        <span className={styles.detailLabel}>Scheduled</span>
                                                        <strong>{alert.scheduled}</strong>
                                                    </div>
                                                    <div>
                                                        <span className={styles.detailLabel}>Route</span>
                                                        <strong>{alert.route}</strong>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    className={styles.alertAction}
                                                    onClick={() => {
                                                        const medication = medications.find(
                                                            (med) => med._id === alert.id,
                                                        )
                                                        if (medication) {
                                                            openMedicationModal(medication)
                                                        }
                                                    }}
                                                >
                                                    Administer Now
                                                </button>
                                            </article>
                                        )
                                    })}
                                </div>
                            </section>
                        )}

                        {vitalSchedules.length === 0 && timeline.length === 0 ? (
                            <p className={styles.emptyText}>No medication or vital schedules for today.</p>
                        ) : (
                            <>
                                {vitalSchedules.length > 0 && (
                                    <section className={styles.section}>
                                        <div className={styles.sectionHeader}>
                                            <div className={styles.sectionTitleWrap}>
                                                <Heart size={18} className={styles.sectionIconInfo} />
                                                <div>
                                                    <h3 className={styles.sectionTitle}>Vital Checks</h3>
                                                    <p className={styles.sectionHint}>
                                                        Active vital plans ready for logging
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.vitalsGrid}>
                                            {vitalSchedules.map((schedule) => {
                                                const type = schedule.vitalType
                                                const Icon = iconMap[type] || Activity
                                                const label = labelMap[type] || type
                                                const unit = unitMap[type] || ''
                                                const scheduleTimeLabel = `${formatDate(schedule.scheduleTime)}, ${formatTime(schedule.scheduleTime)}`
                                                const statusLabel =
                                                    schedule.status === 'pending'
                                                        ? 'Pending'
                                                        : schedule.status === 'recorded'
                                                          ? 'Recorded'
                                                          : schedule.status === 'missed'
                                                            ? 'Missed'
                                                            : schedule.status

                                                return (
                                                    <article
                                                        key={schedule._id}
                                                        className={styles.vitalCard}
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={() => openVitalModal(type, schedule)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                e.preventDefault()
                                                                openVitalModal(type, schedule)
                                                            }
                                                        }}
                                                    >
                                                        <div className={styles.vitalTop}>
                                                            <span className={styles.vitalLabel}>{label}</span>
                                                            <span
                                                                className={styles.vitalStatus}
                                                                data-status={schedule.status}
                                                            >
                                                                {statusLabel}
                                                            </span>
                                                        </div>
                                                        <div className={styles.vitalValueRow}>
                                                            <Icon size={18} className={styles.vitalIcon} />
                                                            {schedule.status === 'recorded' &&
                                                            schedule.recordedValue ? (
                                                                <div className={styles.vitalValueWrap}>
                                                                    <strong className={styles.vitalValue}>
                                                                        {type === 'blood_pressure'
                                                                            ? `${schedule.recordedValue.systolic ?? ''}/${schedule.recordedValue.diastolic ?? ''}`
                                                                            : (schedule.recordedValue.value ?? '')}
                                                                        <span className={styles.vitalUnit}>
                                                                            {' '}
                                                                            {schedule.recordedValue.unit || unit}
                                                                        </span>
                                                                    </strong>
                                                                    <span className={styles.vitalDate}>
                                                                        {formatDate(schedule.recordedAt!)}{' '}
                                                                        {formatTime(schedule.recordedAt!)}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className={styles.vitalValueWrap}>
                                                                    <span className={styles.vitalTime}>
                                                                        {scheduleTimeLabel}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className={styles.vitalLog}>
                                                            {schedule.status === 'pending' && (
                                                                <span
                                                                    className={styles.logVital}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        openVitalModal(type, schedule)
                                                                    }}
                                                                >
                                                                    Log reading
                                                                </span>
                                                            )}
                                                        </div>
                                                    </article>
                                                )
                                            })}
                                        </div>
                                    </section>
                                )}

                                {timeline.length > 0 && (
                                    <section className={styles.section}>
                                        <div className={styles.sectionHeader}>
                                            <div className={styles.sectionTitleWrap}>
                                                <ClipboardPlus size={18} className={styles.sectionIconInfo} />
                                                <h3 className={styles.sectionTitle}>Medication Update</h3>
                                            </div>
                                            <button
                                                type="button"
                                                className={styles.dangerAction}
                                                onClick={openSymptomModal}
                                            >
                                                Add Symptoms
                                            </button>
                                        </div>

                                        <div className={styles.timeline}>
                                            {timeline.map((item, index) => {
                                                const meta = toneMeta[item.tone]
                                                const SectionIcon = meta.sectionIcon

                                                return (
                                                    <article
                                                        key={`${item.time}-${item.medicine}-${index}`}
                                                        className={styles.timelineRow}
                                                    >
                                                        <div className={styles.timelineTime}>
                                                            <span>{item.time}</span>
                                                        </div>
                                                        <div className={styles.timelineLine} />
                                                        <div
                                                            className={`${styles.timelineCard} ${meta.timelineClassName}`}
                                                        >
                                                            <div className={styles.timelineTop}>
                                                                <div className={styles.timelineTitleWrap}>
                                                                    <SectionIcon size={16} />
                                                                    <span className={styles.timelineTitle}>
                                                                        {item.title}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className={styles.timelineContent}>
                                                                <div className={styles.timelineText}>
                                                                    <h4>{item.medicine}</h4>
                                                                    <p>{item.note}</p>
                                                                    <span>Route: {item.route}</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className={
                                                                        item.tone === 'success'
                                                                            ? styles.timelineSuccessBtn
                                                                            : styles.timelineActionBtn
                                                                    }
                                                                    onClick={() => {
                                                                        if (item.actionLabel === 'Take Action') {
                                                                            const medication = medications.find(
                                                                                (med) => med._id === item.id,
                                                                            )
                                                                            if (medication) {
                                                                                openMedicationModal(medication)
                                                                            }
                                                                        }
                                                                    }}
                                                                    disabled={item.actionLabel !== 'Take Action'}
                                                                >
                                                                    {item.actionLabel}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </article>
                                                )
                                            })}
                                        </div>
                                    </section>
                                )}
                            </>
                        )}
                    </Section>

                    <Modal
                        isOpen={isMedicationModalOpen}
                        onClose={closeMedicationModal}
                        title="Log Medication"
                        size="md"
                        footer={
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.modalCancelBtn} onClick={closeMedicationModal}>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className={styles.modalSaveBtn}
                                    disabled={
                                        isSavingMedication || !medicationLogForm.takenTime || !medicationLogForm.route
                                    }
                                    onClick={handleMedicationLogSubmit}
                                >
                                    {isSavingMedication ? 'Saving...' : 'Save Log'}
                                </button>
                            </div>
                        }
                    >
                        {selectedMedication && (
                            <div className={styles.medicationModalBody}>
                                <div className={styles.modalFieldGrid}>
                                    <label className={styles.modalField}>
                                        <span className={styles.modalLabel}>Medication Selection</span>
                                        <input
                                            className={styles.modalInput}
                                            value={selectedMedication.medicineName}
                                            readOnly
                                        />
                                    </label>
                                    <label className={styles.modalField}>
                                        <span className={styles.modalLabel}>Dosage Amount</span>
                                        <input
                                            className={styles.modalInput}
                                            value={selectedMedication.dosage}
                                            readOnly
                                        />
                                    </label>
                                </div>

                                <div className={styles.statusSection}>
                                    <span className={styles.modalLabel}>Medication Status</span>
                                    <div className={styles.statusPillGroup}>
                                        <button
                                            type="button"
                                            className={`${styles.statusPill} ${medicationLogForm.status === 'on_time' ? styles.statusPillActive : ''}`}
                                            onClick={() =>
                                                setMedicationLogForm((current) => ({ ...current, status: 'on_time' }))
                                            }
                                        >
                                            <CheckCircle2 size={18} />
                                            On Time
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.statusPill} ${medicationLogForm.status === 'taken_late' ? styles.statusPillActive : ''}`}
                                            onClick={() =>
                                                setMedicationLogForm((current) => ({
                                                    ...current,
                                                    status: 'taken_late',
                                                }))
                                            }
                                        >
                                            <Clock4 size={18} />
                                            Taken Late
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.statusPill} ${medicationLogForm.status === 'skipped' ? styles.statusPillActive : ''}`}
                                            onClick={() =>
                                                setMedicationLogForm((current) => ({ ...current, status: 'skipped' }))
                                            }
                                        >
                                            <CircleX size={18} />
                                            Skipped
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.modalFieldGrid}>
                                    <label className={styles.modalField}>
                                        <span className={styles.modalLabel}>Taken Time</span>
                                        <input
                                            type="time"
                                            className={styles.modalInput}
                                            value={medicationLogForm.takenTime}
                                            onChange={(e) =>
                                                setMedicationLogForm((current) => ({
                                                    ...current,
                                                    takenTime: e.target.value,
                                                }))
                                            }
                                        />
                                    </label>
                                    <label className={styles.modalField}>
                                        <span className={styles.modalLabel}>Route</span>
                                        <select
                                            className={styles.modalSelect}
                                            value={medicationLogForm.route}
                                            onChange={(e) =>
                                                setMedicationLogForm((current) => ({
                                                    ...current,
                                                    route: e.target.value,
                                                }))
                                            }
                                        >
                                            <option value="oral">Oral</option>
                                            <option value="injection">Injection</option>
                                            <option value="IV">IV</option>
                                            <option value="inhalation">Inhalation</option>
                                        </select>
                                    </label>
                                </div>

                                <label className={styles.modalField}>
                                    <span className={styles.modalLabel}>Observations</span>
                                    <textarea
                                        className={styles.modalTextarea}
                                        placeholder="Provide context, triggers, or specific details..."
                                        value={medicationLogForm.observations}
                                        onChange={(e) =>
                                            setMedicationLogForm((current) => ({
                                                ...current,
                                                observations: e.target.value,
                                            }))
                                        }
                                    />
                                </label>
                            </div>
                        )}
                    </Modal>

                    <Modal
                        isOpen={isVitalModalOpen}
                        onClose={closeVitalModal}
                        title="Log Vital Reading"
                        size="sm"
                        footer={
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.modalCancelBtn} onClick={closeVitalModal}>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className={styles.modalSaveBtn}
                                    disabled={
                                        isSavingVital ||
                                        !vitalLogForm.vitalType ||
                                        !vitalLogForm.recordedAt ||
                                        (isBloodPressure
                                            ? !vitalLogForm.systolic || !vitalLogForm.diastolic
                                            : !vitalLogForm.value)
                                    }
                                    onClick={handleVitalLogSubmit}
                                >
                                    {isSavingVital ? 'Saving...' : 'Save Reading'}
                                </button>
                            </div>
                        }
                    >
                        <div className={styles.vitalModalBody}>
                            <label className={styles.modalField}>
                                <span className={styles.modalLabel}>Vital Type</span>
                                <select
                                    className={styles.modalSelect}
                                    value={vitalLogForm.vitalType}
                                    onChange={(e) => handleVitalTypeChange(e.target.value)}
                                >
                                    {vitalSchedules.length > 0 ? (
                                        [...new Set(vitalSchedules.map((s) => s.vitalType))].map((type) => (
                                            <option key={type} value={type}>
                                                {labelMap[type] || type}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="blood_pressure">Blood Pressure</option>
                                    )}
                                </select>
                            </label>

                            {isBloodPressure ? (
                                <div className={styles.vitalMeasureSection}>
                                    <span className={styles.modalLabel}>Blood Pressure Measurement</span>
                                    <div className={styles.bpGrid}>
                                        <label className={styles.modalField}>
                                            <span className={styles.measureLabel}>Systolic</span>
                                            <div className={styles.unitInputWrap}>
                                                <input
                                                    className={styles.modalInput}
                                                    value={vitalLogForm.systolic}
                                                    onChange={(e) =>
                                                        setVitalLogForm((current) => ({
                                                            ...current,
                                                            systolic: e.target.value,
                                                        }))
                                                    }
                                                />
                                                <span className={styles.inputUnit}>mmHg</span>
                                            </div>
                                        </label>
                                        <label className={styles.modalField}>
                                            <span className={styles.measureLabel}>Diastolic</span>
                                            <div className={styles.unitInputWrap}>
                                                <input
                                                    className={styles.modalInput}
                                                    value={vitalLogForm.diastolic}
                                                    onChange={(e) =>
                                                        setVitalLogForm((current) => ({
                                                            ...current,
                                                            diastolic: e.target.value,
                                                        }))
                                                    }
                                                />
                                                <span className={styles.inputUnit}>mmHg</span>
                                            </div>
                                        </label>
                                    </div>
                                    <span className={styles.rangeHint}>
                                        Normal range: 90-120 systolic / 60-80 diastolic
                                    </span>
                                </div>
                            ) : (
                                <label className={styles.modalField}>
                                    <span className={styles.modalLabel}>{selectedVitalLabel} Measurement</span>
                                    <div className={styles.singleMeasureWrap}>
                                        <Gauge size={18} className={styles.measureIcon} />
                                        <input
                                            className={styles.measureInput}
                                            value={vitalLogForm.value}
                                            onChange={(e) =>
                                                setVitalLogForm((current) => ({ ...current, value: e.target.value }))
                                            }
                                            placeholder={`Enter ${selectedVitalLabel.toLowerCase()}`}
                                        />
                                        <span className={styles.measureUnit}>{selectedVitalUnit}</span>
                                    </div>
                                </label>
                            )}

                            <label className={styles.modalField}>
                                <span className={styles.modalLabel}>Recorded At</span>
                                <input
                                    type="time"
                                    className={styles.modalInput}
                                    value={vitalLogForm.recordedAt}
                                    onChange={(e) =>
                                        setVitalLogForm((current) => ({ ...current, recordedAt: e.target.value }))
                                    }
                                />
                            </label>

                            <label className={styles.modalField}>
                                <span className={styles.modalLabel}>Observation / Notes</span>
                                <textarea
                                    className={styles.modalTextarea}
                                    placeholder="Optional: patient seated for 5 minutes, right arm measurement..."
                                    value={vitalLogForm.notes}
                                    onChange={(e) =>
                                        setVitalLogForm((current) => ({ ...current, notes: e.target.value }))
                                    }
                                />
                            </label>
                        </div>
                    </Modal>

                    <Modal
                        isOpen={isSymptomModalOpen}
                        onClose={closeSymptomModal}
                        title="Log Symptom"
                        size="sm"
                        footer={
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.modalCancelBtn} onClick={closeSymptomModal}>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className={styles.modalSaveBtn}
                                    disabled={isSavingSymptom || !symptomLogForm.symptom || !symptomLogForm.onsetTime}
                                    onClick={handleSymptomLogSubmit}
                                >
                                    {isSavingSymptom ? 'Saving...' : 'Save Log'}
                                </button>
                            </div>
                        }
                    >
                        <div className={styles.symptomModalBody}>
                            <div className={styles.modalFieldGrid}>
                                <label className={styles.modalField}>
                                    <span className={styles.modalLabel}>Select Symptom</span>
                                    <select
                                        className={styles.modalSelect}
                                        value={symptomLogForm.symptom}
                                        onChange={(e) =>
                                            setSymptomLogForm((current) => ({
                                                ...current,
                                                symptom: e.target.value,
                                            }))
                                        }
                                    >
                                        {symptomOptions.map((symptom) => (
                                            <option key={symptom} value={symptom}>
                                                {symptom}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className={styles.modalField}>
                                    <span className={styles.modalLabel}>Onset Time</span>
                                    <input
                                        type="time"
                                        className={styles.modalInput}
                                        value={symptomLogForm.onsetTime}
                                        onChange={(e) =>
                                            setSymptomLogForm((current) => ({
                                                ...current,
                                                onsetTime: e.target.value,
                                            }))
                                        }
                                    />
                                </label>
                            </div>

                            <div className={styles.severitySection}>
                                <span className={styles.modalLabel}>Severity Level</span>
                                <div className={styles.severityGrid}>
                                    {(['mild', 'moderate', 'severe', 'critical'] as SymptomSeverity[]).map((level) => (
                                        <button
                                            key={level}
                                            type="button"
                                            className={`${styles.severityPill} ${styles[`severity${level.charAt(0).toUpperCase() + level.slice(1)}`]} ${symptomLogForm.severity === level ? styles.severityPillActive : ''}`}
                                            onClick={() =>
                                                setSymptomLogForm((current) => ({
                                                    ...current,
                                                    severity: level,
                                                }))
                                            }
                                        >
                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <label className={styles.modalField}>
                                <span className={styles.modalLabel}>Detailed Observations</span>
                                <textarea
                                    className={styles.modalTextarea}
                                    placeholder="Provide context, triggers, or specific details..."
                                    value={symptomLogForm.observations}
                                    onChange={(e) =>
                                        setSymptomLogForm((current) => ({
                                            ...current,
                                            observations: e.target.value,
                                        }))
                                    }
                                />
                            </label>
                        </div>
                    </Modal>
                </>
            )}
        </MainWrapper>
    )
}

export default CaregiverPatients
