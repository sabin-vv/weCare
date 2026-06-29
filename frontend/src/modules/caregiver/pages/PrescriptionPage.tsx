import { Activity, Clock, Droplet, Heart, Wind } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

import { getMyPatients, getPatientPrescriptions, getPatientVitalPlans, type PatientSummary } from '../api/caregiver.api'
import ProfileCard from '../components/ProfileCard/ProfileCard'
import type { PrescriptionItem, VitalPlanItem } from '../types/caregiver.types'

import styles from './PrescriptionPage.module.css'

import MainWrapper from '@/shared/components/MainWrapper/MainWrapper'
import { Section } from '@/shared/components/Section/Section'
import { getErrorMessage } from '@/utils/getErrorMessage'

const vitalIconMap: Record<string, typeof Activity> = {
    blood_pressure: Heart,
    blood_sugar: Droplet,
    heart_rate: Activity,
    spo2: Wind,
}

const vitalLabelMap: Record<string, string> = {
    blood_pressure: 'Blood Pressure',
    blood_sugar: 'Blood Sugar',
    heart_rate: 'Heart Rate',
    spo2: 'SpO2',
}

const statusLabelMap: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: 'statusActive' },
    on_hold: { label: 'On Hold', className: 'statusOnHold' },
    discontinued: { label: 'Discontinued', className: 'statusDiscontinued' },
    amended: { label: 'Amended', className: 'statusAmended' },
    completed: { label: 'Completed', className: 'statusCompleted' },
}

const PrescriptionPage = () => {
    const { patientId } = useParams<{ patientId: string }>()
    const [patient, setPatient] = useState<PatientSummary | null>(null)
    const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([])
    const [vitalPlans, setVitalPlans] = useState<VitalPlanItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const loadAll = async () => {
            if (!patientId) return
            try {
                const [patientData, prescData, vitalData] = await Promise.all([
                    getMyPatients(),
                    getPatientPrescriptions(patientId),
                    getPatientVitalPlans(patientId),
                ])
                setPatient(patientData[0] ?? null)
                setPrescriptions(prescData)
                setVitalPlans(vitalData)
            } catch (err) {
                console.error('Error loading prescription page:', err)
                toast.error(getErrorMessage(err))
            } finally {
                setIsLoading(false)
            }
        }
        loadAll()
    }, [patientId])

    const activePrescriptions = prescriptions.filter((p) => p.status === 'active')

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

    if (isLoading) {
        return (
            <MainWrapper>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner} />
                </div>
            </MainWrapper>
        )
    }

    if (!patient) {
        return (
            <MainWrapper title="Prescription">
                <p className={styles.emptyText}>Patient not found.</p>
            </MainWrapper>
        )
    }

    return (
        <MainWrapper title="Prescription">
            <ProfileCard
                patient={patient}
                action={{
                    label: 'View Medication',
                    onClick: () => {
                        navigate(`/caregiver/patients`)
                    },
                }}
            />

            <Section title="Prescriptions" actions={`${activePrescriptions.length} active`}>
                {activePrescriptions.length === 0 ? (
                    <p className={styles.emptyText}>No active prescriptions.</p>
                ) : (
                    <div className={styles.cardGrid}>
                        {activePrescriptions.map((prescription) => (
                            <PrescriptionCard
                                key={prescription._id}
                                prescription={prescription}
                                formatDate={formatDate}
                            />
                        ))}
                    </div>
                )}
            </Section>

            <Section title="Vital Plans" actions={`${vitalPlans.length} plans`}>
                {vitalPlans.length === 0 ? (
                    <p className={styles.emptyText}>No vital plans assigned.</p>
                ) : (
                    <div className={styles.vitalGrid}>
                        {vitalPlans.map((plan, i) => {
                            const Icon = vitalIconMap[plan.type] || Activity
                            const label = vitalLabelMap[plan.type] || plan.type
                            return (
                                <article key={`${plan.type}-${i}`} className={styles.vitalCard}>
                                    <div className={styles.vitalCardTop}>
                                        <Icon size={20} className={styles.vitalIcon} />
                                        <span className={styles.vitalCardLabel}>{label}</span>
                                    </div>
                                    <div className={styles.vitalDetail}>
                                        <span className={styles.vitalDetailLabel}>Every</span>
                                        <strong>
                                            {plan.frequencyValue} {plan.frequencyUnit}
                                        </strong>
                                    </div>
                                    <div className={styles.vitalDetail}>
                                        <span className={styles.vitalDetailLabel}>Duration</span>
                                        <strong>
                                            {plan.durationValue} {plan.durationUnit}
                                        </strong>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                )}
            </Section>
        </MainWrapper>
    )
}

interface PrescriptionCardProps {
    prescription: PrescriptionItem
    formatDate: (iso: string) => string
}

const PrescriptionCard = ({ prescription, formatDate }: PrescriptionCardProps) => {
    const statusMeta = statusLabelMap[prescription.status] || statusLabelMap.active
    return (
        <article className={styles.prescriptionCard}>
            <div className={styles.prescHeader}>
                <span className={`${styles.statusBadge} ${styles[statusMeta.className]}`}>{statusMeta.label}</span>
                <div className={styles.prescMeta}>
                    {prescription.endDate && (
                        <span className={styles.prescDate}>
                            <Clock size={14} />
                            Ends {formatDate(prescription.endDate)}
                        </span>
                    )}
                </div>
            </div>

            <div className={styles.medList}>
                {prescription.medications.map((med, i) => (
                    <div key={i} className={styles.medItem}>
                        <div className={styles.medNameRow}>
                            <strong className={styles.medName}>{med.name}</strong>
                            <span className={styles.medDosage}>{med.dosage}</span>
                            {med.priority && med.priority !== 'Medium' && (
                                <span className={`${styles.priorityBadge} ${styles[`priority${med.priority}`]}`}>
                                    {med.priority}
                                </span>
                            )}
                        </div>
                        <div className={styles.medDetails}>
                            <span>{med.route}</span>
                            <span className={styles.medDot}>•</span>
                            <span>{med.frequency}</span>
                            {med.instructions && (
                                <>
                                    <span className={styles.medDot}>•</span>
                                    <span className={styles.medInstructions}>{med.instructions}</span>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {prescription.note && <p className={styles.prescNote}>{prescription.note}</p>}
        </article>
    )
}

export default PrescriptionPage
