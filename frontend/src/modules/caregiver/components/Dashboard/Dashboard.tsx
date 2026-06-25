import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import {
    acknowledgeAlert,
    getCaregiverActivityLogs,
    getCaregiverAlerts,
    getMyPatients,
    getPatientMedications,
    getPatientVitalSchedules,
} from '../../api/caregiver.api'
import type {
    AlertData,
    CaregiverActivityLogItem,
    MedicationSchedule,
    PatientSummary,
    VitalScheduleItem,
} from '../../types/caregiver.types'

import styles from './Dashboard.module.css'

import { AlertCard } from '@/modules/doctor/components/AlertCard'
import Button from '@/shared/components/Button/Button'
import { Section } from '@/shared/components/Section/Section'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { getFileUrl } from '@/utils/getFileUrl'

const DASHBOARD_LIMIT = 4

const isToday = (dateStr: string) => new Date(dateStr).toDateString() === new Date().toDateString()

const getRiskLabel = (riskLevel: string): string => {
    switch (riskLevel) {
        case 'high_risk':
            return 'Critical'
        case 'severe':
            return 'High'
        case 'moderate':
            return 'Moderate'
        default:
            return 'Mild'
    }
}

const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
    }
    return age
}

const PatientRow = ({ patient }: { patient: PatientSummary }) => {
    const [imgError, setImgError] = useState(false)
    const initials = patient.userName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    const age = calculateAge(patient.dateOfBirth)
    const imageUrl = patient.profileImage ? getFileUrl(patient.profileImage) : ''

    return (
        <div className={styles.patientRow}>
            <div className={styles.patientRowHeader}>
                <div className={styles.patientAvatar}>
                    {imageUrl && !imgError ? (
                        <img src={imageUrl} alt={patient.userName} onError={() => setImgError(true)} />
                    ) : (
                        initials
                    )}
                </div>
                <div>
                    <span className={styles.patientName}>{patient.userName}</span>
                    <span className={styles.patientMeta}>Patient ID: #{patient.patientId}</span>
                </div>
            </div>
            <div className={styles.patientRowBody}>
                <div className={styles.basicInfo}>
                    <span className={styles.fieldLabel}>Age: </span>
                    <span className={styles.basicInfoValue}>{age} yrs</span>
                </div>
                <div className={styles.basicInfo}>
                    <span className={styles.fieldLabel}>Gender: </span>
                    <span className={styles.basicInfoValue}>{patient.gender}</span>
                </div>
            </div>

            <div className={styles.patientRowBody}>
                <div className={styles.patientField}>
                    <span className={styles.fieldLabel}>Risk Level</span>
                    <span className={`${styles.riskBadge} ${styles[`risk${getRiskLabel(patient.riskLevel)}`]}`}>
                        {getRiskLabel(patient.riskLevel)}
                    </span>
                </div>
                <div className={styles.patientField}>
                    <span className={styles.fieldLabel}>Clinical Status</span>
                    <span className={`${styles.clinicalBadge} ${styles[patient.clinicalStatus]}`}>
                        {patient.clinicalStatus}
                    </span>
                </div>
            </div>

            {patient.conditions.length > 0 && (
                <div className={styles.conditionsBlock}>
                    <span className={styles.fieldLabel}>Conditions</span>
                    <ul className={styles.conditionList}>
                        {patient.conditions.map((c) => (
                            <li key={c}>{c}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className={styles.patientField}>
                <span className={styles.fieldLabel}>Assigned Doctor</span>
                <span className={styles.fieldValue}>
                    {patient.assignedDoctorName ? `Dr. ${patient.assignedDoctorName}` : 'Not assigned'}
                </span>
            </div>
        </div>
    )
}

const Dashboard = () => {
    const navigate = useNavigate()
    const [patients, setPatients] = useState<PatientSummary[]>([])
    const [alerts, setAlerts] = useState<AlertData[]>([])
    const [medications, setMedications] = useState<(MedicationSchedule & { patientName: string })[]>([])
    const [vitals, setVitals] = useState<(VitalScheduleItem & { patientName: string })[]>([])
    const [activities, setActivities] = useState<CaregiverActivityLogItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const [patientsData, alertsData, activityData] = await Promise.all([
                    getMyPatients(),
                    getCaregiverAlerts({ status: 'open', limit: DASHBOARD_LIMIT }),
                    getCaregiverActivityLogs(1, 4),
                ])
                setPatients(patientsData)
                setAlerts(alertsData.alerts)
                setActivities(activityData.data)

                const medPromises = patientsData.map(async (p) => {
                    const meds = await getPatientMedications(p._id)
                    return meds.filter((m) => isToday(m.scheduleTime)).map((m) => ({ ...m, patientName: p.userName }))
                })
                const vitalPromises = patientsData.map(async (p) => {
                    const v = await getPatientVitalSchedules(p._id)
                    return v.filter((vs) => isToday(vs.scheduleTime)).map((vs) => ({ ...vs, patientName: p.userName }))
                })

                const [medResults, vitalResults] = await Promise.all([
                    Promise.all(medPromises),
                    Promise.all(vitalPromises),
                ])

                setMedications(
                    medResults
                        .flat()
                        .sort((a, b) => new Date(a.scheduleTime).getTime() - new Date(b.scheduleTime).getTime()),
                )
                setVitals(
                    vitalResults
                        .flat()
                        .sort((a, b) => new Date(a.scheduleTime).getTime() - new Date(b.scheduleTime).getTime()),
                )
            } catch (error) {
                toast.error(getErrorMessage(error))
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleAcknowledge = async (alertId: string) => {
        try {
            await acknowledgeAlert(alertId)
            setAlerts((prev) => prev.filter((a) => a._id !== alertId))
            toast.success('Alert acknowledged')
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const formatTime = (iso: string) => {
        const d = new Date(iso)
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }

    if (isLoading) {
        return <div className={styles.loading}>Loading dashboard...</div>
    }

    return (
        <>
            <div className={styles.twoColumn}>
                <Section title="Today's Activity">
                    <div className={styles.activityList}>
                        {activities.length === 0 ? (
                            <p className={styles.empty}>No activity today</p>
                        ) : (
                            activities.map((a) => (
                                <div key={a.id} className={styles.activityItem}>
                                    <div className={styles.activityTop}>
                                        <span className={styles.activityAction}>
                                            {a.activityType.replace(/_/g, ' ')}
                                        </span>
                                        <span className={styles.activityTime}>
                                            {new Date(a.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <span className={styles.activityDescription}>
                                        {a.patientName} &middot; {a.description}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </Section>

                <Section
                    title="Patient Summary"
                    actions={
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            fullWidth={false}
                            leftIcon={<ArrowRight size={16} />}
                            onClick={() => navigate('/caregiver/patients')}
                        >
                            View All
                        </Button>
                    }
                >
                    <div className={styles.patientSummaryList}>
                        {patients.length === 0 ? (
                            <p className={styles.empty}>No patients assigned</p>
                        ) : (
                            patients.slice(0, DASHBOARD_LIMIT).map((p) => <PatientRow key={p._id} patient={p} />)
                        )}
                    </div>
                </Section>
            </div>
            <div className={styles.twoColumn}>
                <Section
                    title="Today's Medication Schedule"
                    actions={
                        medications.length > 0 && (
                            <span className={styles.scheduleCount}>{medications.length} pending</span>
                        )
                    }
                >
                    <div className={styles.scheduleList}>
                        {medications.length === 0 ? (
                            <p className={styles.empty}>No medications scheduled for today</p>
                        ) : (
                            medications.slice(0, DASHBOARD_LIMIT).map((med) => (
                                <div key={med._id} className={styles.scheduleRow}>
                                    <div className={styles.scheduleTimeCol}>
                                        <span className={styles.scheduleTime}>{formatTime(med.scheduleTime)}</span>
                                    </div>
                                    <div className={styles.scheduleInfo}>
                                        <span className={styles.scheduleTitle}>{med.medicineName}</span>
                                        <span className={styles.scheduleMeta}>
                                            {med.patientName} &middot; {med.dosage} &middot; {med.route}
                                        </span>
                                    </div>
                                    <span className={`${styles.scheduleStatus} ${styles[med.status]}`}>
                                        {med.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </Section>

                <Section
                    title="Today's Vital Checks"
                    actions={vitals.length > 0 && <span className={styles.scheduleCount}>{vitals.length} pending</span>}
                >
                    <div className={styles.scheduleList}>
                        {vitals.length === 0 ? (
                            <p className={styles.empty}>No vital checks scheduled for today</p>
                        ) : (
                            vitals.slice(0, DASHBOARD_LIMIT).map((v) => (
                                <div key={v._id} className={styles.scheduleRow}>
                                    <div className={styles.scheduleTimeCol}>
                                        <span className={styles.scheduleTime}>{formatTime(v.scheduleTime)}</span>
                                    </div>
                                    <div className={styles.scheduleInfo}>
                                        <span className={styles.scheduleTitle}>{v.vitalType.replace(/_/g, ' ')}</span>
                                        <span className={styles.scheduleMeta}>{v.patientName}</span>
                                    </div>
                                    <span className={`${styles.scheduleStatus} ${styles[v.status]}`}>{v.status}</span>
                                </div>
                            ))
                        )}
                    </div>
                </Section>
            </div>

            <Section
                title="Open Alerts"
                actions={
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        fullWidth={false}
                        leftIcon={<ArrowRight size={16} />}
                        onClick={() => navigate('/caregiver/patients')}
                    >
                        View All
                    </Button>
                }
            >
                <div className={styles.alertList}>
                    {alerts.length === 0 ? (
                        <p className={styles.empty}>No open alerts</p>
                    ) : (
                        alerts.map((alert) => (
                            <AlertCard
                                key={alert._id}
                                patientName={
                                    typeof alert.patientId === 'object' && 'userId' in alert.patientId
                                        ? alert.patientId.userId.name
                                        : 'Unknown'
                                }
                                message={alert.triggerReason}
                                timestamp={new Date(alert.triggeredAt).toLocaleString()}
                                severity={alert.severity}
                                status={alert.status}
                                icon={<span className={styles.alertIcon}>!</span>}
                                onAcknowledge={() => handleAcknowledge(alert._id)}
                            />
                        ))
                    )}
                </div>
            </Section>
        </>
    )
}

export default Dashboard
