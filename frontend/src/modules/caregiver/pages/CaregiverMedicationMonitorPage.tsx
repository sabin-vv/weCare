import {
    Activity,
    AlertCircle,
    BadgeAlert,
    CheckCircle2,
    ChevronRight,
    ClipboardPlus,
    Clock3,
    Clock4,
    CircleX,
    Gauge,
    Droplet,
    Heart,
    RefreshCw,
    ShieldAlert,
    Thermometer,
    Wind,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'

import {
    getPatientMedications,
    getPatientVitalPlans,
    logMedicationAction,
    logSymptom,
    logVitalReading,
    type MedicationSchedule,
    type VitalPlanItem,
} from '../api/caregiver.api'
import type {
    AlertCard,
    MedicationLogFormState,
    SymptomLogFormState,
    SymptomSeverity,
    TimelineItem,
    VitalLogFormState,
} from '../types/caregiver.types'

import styles from './CaregiverMedicationMonitorPage.module.css'

import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import Modal from '@/shared/components/Modal/Modal'
import { getErrorMessage } from '@/utils/getErrorMessage'

const iconMap: Record<string, typeof Activity> = {
    blood_pressure: Heart,
    blood_sugar: Droplet,
    heart_rate: Activity,
    temperature: Thermometer,
    oxygen_saturation: Wind,
}

const labelMap: Record<string, string> = {
    blood_pressure: 'Blood Pressure',
    blood_sugar: 'Blood Sugar',
    heart_rate: 'Heart Rate',
    temperature: 'Temperature',
    oxygen_saturation: 'SpO2',
}

const unitMap: Record<string, string> = {
    blood_pressure: 'mmHg',
    blood_sugar: 'mg/dL',
    heart_rate: 'BPM',
    temperature: '\u00b0F',
    oxygen_saturation: '%',
}

const formatVitalValue = (vital: VitalPlanItem) => {
    const latest = vital.latestReading
    if (!latest) {
        return { value: '—', unit: unitMap[vital.type] || '' }
    }

    if (vital.type === 'blood_pressure') {
        if (latest.systolic !== undefined && latest.diastolic !== undefined) {
            return {
                value: `${latest.systolic}/${latest.diastolic}`,
                unit: latest.unit || unitMap[vital.type] || '',
            }
        }

        return { value: '—', unit: latest.unit || unitMap[vital.type] || '' }
    }

    if (latest.value !== undefined) {
        return {
            value: String(latest.value),
            unit: latest.unit || unitMap[vital.type] || '',
        }
    }

    return { value: '—', unit: latest.unit || unitMap[vital.type] || '' }
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

const CaregiverMedicationMonitorPage = () => {
    const { patientId } = useParams<{ patientId: string }>()
    const [medications, setMedications] = useState<MedicationSchedule[]>([])
    const [vitalPlans, setVitalPlans] = useState<VitalPlanItem[]>([])
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

    const fetchData = async (showRefreshLoader = false) => {
        if (!patientId) return
        try {
            if (showRefreshLoader) setIsRefreshing(true)
            const [medData, vitalData] = await Promise.all([
                getPatientMedications(patientId),
                getPatientVitalPlans(patientId),
            ])
            setMedications(medData)
            setVitalPlans(vitalData)
        } catch (err) {
            console.error('Error fetching data:', err)
            toast.error(getErrorMessage(err))
        } finally {
            setIsLoading(false)
            if (showRefreshLoader) setIsRefreshing(false)
        }
    }

    const handleRefresh = () => {
        fetchData(true)
    }

    useEffect(() => {
        fetchData()
    }, [patientId])

    const alerts: AlertCard[] = medications
        .filter((med) => med.status === 'missed' || med.status === 'pending')
        .map((med) => {
            const time = new Date(med.scheduleTime)
            const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
            const isOverdue = med.status === 'missed' || time < new Date()
            return {
                id: med._id,
                title: med.status === 'missed' ? 'Missed Dose' : 'Pending Dose',
                medicine: med.medicineName,
                scheduled: timeStr,
                route: med.route,
                overdue: isOverdue ? 'Needs attention' : '',
                tone: med.status === 'missed' ? 'critical' : 'warning',
            }
        })

    const timeline: TimelineItem[] = [...medications]
        .sort((a, b) => new Date(a.scheduleTime).getTime() - new Date(b.scheduleTime).getTime())
        .map((med) => {
            const time = new Date(med.scheduleTime)
            const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
            const note =
                med.status === 'administered' ? 'Administered' : med.status === 'missed' ? 'Missed dose' : 'Scheduled'
            return {
                id: med._id,
                time: timeStr,
                title:
                    med.status === 'administered'
                        ? `Medication Administered`
                        : med.status === 'missed'
                          ? `Medication Deviation`
                          : `Medication Scheduled`,
                medicine: `${med.medicineName} ${med.dosage}`,
                note,
                route: med.route,
                tone: med.status === 'administered' ? 'success' : med.status === 'missed' ? 'critical' : 'warning',
                actionLabel: med.status === 'administered' ? 'Administered' : 'Take Action',
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
        if (!selectedMedication || !patientId) return

        try {
            setIsSavingMedication(true)
            await logMedicationAction(patientId, selectedMedication._id, {
                status: medicationLogForm.status,
                takenTime: medicationLogForm.takenTime,
                route: medicationLogForm.route,
                observations: medicationLogForm.observations.trim() || undefined,
            })
            await fetchData()
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

    const openVitalModal = (vitalType?: string) => {
        const fallbackType = vitalType || vitalPlans[0]?.type || 'blood_pressure'
        const now = new Date()
        const defaultTime = now.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        })

        setVitalLogForm({
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
            vitalType: nextType,
            systolic: nextType === 'blood_pressure' ? current.systolic || '120' : '',
            diastolic: nextType === 'blood_pressure' ? current.diastolic || '80' : '',
            value: nextType === 'blood_pressure' ? '' : current.value,
        }))
    }

    const handleVitalLogSubmit = async () => {
        if (!patientId) return

        try {
            setIsSavingVital(true)
            await logVitalReading(patientId, {
                vitalType: vitalLogForm.vitalType,
                systolic: isBloodPressure ? Number(vitalLogForm.systolic) : undefined,
                diastolic: isBloodPressure ? Number(vitalLogForm.diastolic) : undefined,
                value: !isBloodPressure && vitalLogForm.value ? Number(vitalLogForm.value) : undefined,
                recordedAt: vitalLogForm.recordedAt,
                notes: vitalLogForm.notes.trim() || undefined,
            })
            await fetchData()
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
        if (!patientId) return

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
        <MainWrapper>
            <section className={styles.page}>
                <div className={styles.pageHeader}>
                    <h2 className={styles.pageTitle}>Patient Medication Monitor</h2>
                    <button type="button" className={styles.refreshBtn} onClick={handleRefresh} disabled={isRefreshing}>
                        <RefreshCw size={16} className={isRefreshing ? styles.spinningIcon : ''} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

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
                                                const medication = medications.find((med) => med._id === alert.id)

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

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionTitleWrap}>
                            <Heart size={18} className={styles.sectionIconInfo} />
                            <div>
                                <h3 className={styles.sectionTitle}>Vital Snapshot</h3>
                                <p className={styles.sectionHint}>Latest recorded patient metrics</p>
                            </div>
                        </div>
                        <button type="button" className={styles.secondaryAction} onClick={() => openVitalModal()}>
                            Log Vitals
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className={styles.vitalsGrid}>
                        {vitalPlans.length === 0 ? (
                            <p className={styles.emptyText}>No vital plans assigned to this patient.</p>
                        ) : (
                            vitalPlans.map((vital) => {
                                const Icon = iconMap[vital.type] || Activity
                                const label = labelMap[vital.type] || vital.type
                                const { value, unit } = formatVitalValue(vital)
                                const latestRecordedAt = vital.latestReading?.recordedAt
                                    ? new Date(vital.latestReading.recordedAt).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          hour12: true,
                                      })
                                    : null

                                return (
                                    <article
                                        key={vital.type}
                                        className={styles.vitalCard}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault()
                                                openVitalModal(vital.type)
                                            }
                                        }}
                                    >
                                        <div className={styles.vitalTop}>
                                            <span className={styles.vitalLabel}>{label}</span>
                                            <span className={styles.vitalStatus}>
                                                {latestRecordedAt
                                                    ? 'Latest recorded reading'
                                                    : 'Awaiting first reading'}
                                            </span>
                                        </div>
                                        <div className={styles.vitalValueRow}>
                                            <Icon size={18} className={styles.vitalIcon} />
                                            <div className={styles.vitalValueWrap}>
                                                <strong className={styles.vitalValue}>{value}</strong>
                                                <span className={styles.vitalUnit}>{unit}</span>
                                            </div>
                                        </div>
                                        <span className={styles.vitalUpdated}>
                                            {latestRecordedAt
                                                ? `Last updated at ${latestRecordedAt}`
                                                : `Frequency: every ${vital.frequencyValue} ${vital.frequencyUnit}`}
                                        </span>
                                    </article>
                                )
                            })
                        )}
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionTitleWrap}>
                            <ClipboardPlus size={18} className={styles.sectionIconInfo} />
                            <h3 className={styles.sectionTitle}>Medication Update</h3>
                        </div>
                        <button type="button" className={styles.dangerAction} onClick={openSymptomModal}>
                            Add Symptoms
                        </button>
                    </div>

                    <div className={styles.timeline}>
                        {timeline.length === 0 ? (
                            <p className={styles.emptyText}>No medication schedules for today.</p>
                        ) : (
                            timeline.map((item, index) => {
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
                                        <div className={`${styles.timelineCard} ${meta.timelineClassName}`}>
                                            <div className={styles.timelineTop}>
                                                <div className={styles.timelineTitleWrap}>
                                                    <SectionIcon size={16} />
                                                    <span className={styles.timelineTitle}>{item.title}</span>
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
                            })
                        )}
                    </div>
                </section>
            </section>

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
                        <button type="button" className={styles.modalSaveBtn} onClick={handleMedicationLogSubmit}>
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
                                <input className={styles.modalInput} value={selectedMedication.medicineName} readOnly />
                            </label>
                            <label className={styles.modalField}>
                                <span className={styles.modalLabel}>Dosage Amount</span>
                                <input className={styles.modalInput} value={selectedMedication.dosage} readOnly />
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
                                        setMedicationLogForm((current) => ({ ...current, status: 'taken_late' }))
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
                                    <option value="oral">Oral (Tablet)</option>
                                    <option value="oral">Oral (Liquid)</option>
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
                        <button type="button" className={styles.modalSaveBtn} onClick={handleVitalLogSubmit}>
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
                            {vitalPlans.length > 0 ? (
                                vitalPlans.map((vital) => (
                                    <option key={vital.type} value={vital.type}>
                                        {labelMap[vital.type] || vital.type}
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
                                                setVitalLogForm((current) => ({ ...current, systolic: e.target.value }))
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
                            <span className={styles.rangeHint}>Normal range: 90-120 systolic / 60-80 diastolic</span>
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
                            onChange={(e) => setVitalLogForm((current) => ({ ...current, recordedAt: e.target.value }))}
                        />
                    </label>

                    <label className={styles.modalField}>
                        <span className={styles.modalLabel}>Observation / Notes</span>
                        <textarea
                            className={styles.modalTextarea}
                            placeholder="Optional: patient seated for 5 minutes, right arm measurement..."
                            value={vitalLogForm.notes}
                            onChange={(e) => setVitalLogForm((current) => ({ ...current, notes: e.target.value }))}
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
                        <button type="button" className={styles.modalSaveBtn} onClick={handleSymptomLogSubmit}>
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
        </MainWrapper>
    )
}

export default CaregiverMedicationMonitorPage
