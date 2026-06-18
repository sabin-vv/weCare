import { Heart, Activity, Thermometer, Droplets, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

import {
    cancelPatientVitalPlan,
    getPatientById,
    getPatientVitalPlans,
    startConsultation,
    completeConsultation,
    updatePatientCondition,
    assignCaregiver,
    listCaregivers,
    updateClinicalStatus,
} from '../api/doctor.api'
import MedicationTable from '../components/viewPatient/MedicationTable'
import ProfileCard from '../components/viewPatient/ProfileCard'
import VitalCard from '../components/viewPatient/VitalCard'
import type { CaregiverOption, PatientDetails, RiskLevel, PatientVitalPlan } from '../types/doctor.types'

import styles from './PatientViewPage.module.css'

import DoctorLayout from '@/layout/DoctorLayout'
import { type ConditionResult, searchConditions } from '@/modules/doctor/api/conditionsApi'
import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import Modal from '@/shared/components/Modal/Modal'
import SearchField from '@/shared/components/SearchField/SearchField'
import { Section } from '@/shared/components/Section/Section'
import { getErrorMessage } from '@/utils/getErrorMessage'

const SEVERITY_OPTIONS: Array<{ label: string; value: RiskLevel }> = [
    { label: 'Mild', value: 'mild' },
    { label: 'Moderate', value: 'moderate' },
    { label: 'Severe', value: 'severe' },
    { label: 'High Risk', value: 'high_risk' },
]

const PatientViewPage = () => {
    const { patientId } = useParams<{ patientId: string }>()
    const navigate = useNavigate()
    const [patient, setPatient] = useState<PatientDetails | null>(null)
    const [vitalPlans, setVitalPlans] = useState<PatientVitalPlan[]>([])
    const [cancellingPlanId, setCancellingPlanId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showConditionModal, setShowConditionModal] = useState(false)
    const [conditionQuery, setConditionQuery] = useState('')
    const [selectedConditions, setSelectedConditions] = useState<ConditionResult[]>([])
    const [selectedSeverity, setSelectedSeverity] = useState<RiskLevel | ''>('')
    const [conditionSuggestions, setConditionSuggestions] = useState<ConditionResult[]>([])
    const [isSearchingConditions, setIsSearchingConditions] = useState(false)
    const [isApplyingCondition, setIsApplyingCondition] = useState(false)
    const [showCaregiverModal, setShowCaregiverModal] = useState(false)
    const [caregiverSearch, setCaregiverSearch] = useState('')
    const [caregivers, setCaregivers] = useState<CaregiverOption[]>([])
    const [selectedCaregiver, setSelectedCaregiver] = useState<CaregiverOption | null>(null)
    const [isLoadingCaregivers, setIsLoadingCaregivers] = useState(false)
    const [isAssigningCaregiver, setIsAssigningCaregiver] = useState(false)

    const fetchPatient = useCallback(async () => {
        if (!patientId) return
        setIsLoading(true)
        try {
            const [patientData, vitalPlansData] = await Promise.all([
                getPatientById(patientId),
                getPatientVitalPlans(patientId, 'active'),
            ])
            setPatient(patientData)
            setVitalPlans(vitalPlansData)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }, [patientId])

    useEffect(() => {
        fetchPatient()
    }, [fetchPatient])

    const handleStartConsultation = async () => {
        if (!patientId) return
        try {
            await startConsultation(patientId)
            toast.success('Consultation started')
            fetchPatient()
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const handleCompleteConsultation = async () => {
        if (!patientId) return
        try {
            await completeConsultation(patientId)
            toast.success('Consultation completed')
            fetchPatient()
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const resetConditionModal = () => {
        setConditionQuery('')
        setSelectedConditions(
            (patient?.conditions ?? []).map((condition) => ({
                name: condition,
                code: condition,
            })),
        )
        setSelectedSeverity((patient?.riskLevel as RiskLevel | undefined) ?? '')
        setConditionSuggestions([])
        setIsSearchingConditions(false)
    }

    const handleConditionModalClose = () => {
        resetConditionModal()
        setShowConditionModal(false)
    }

    const handleCaregiverModalClose = () => {
        setShowCaregiverModal(false)
        setCaregiverSearch('')
        setCaregivers([])
        setSelectedCaregiver(null)
    }

    const handleCaregiverModalOpen = () => {
        setShowCaregiverModal(true)
        setCaregiverSearch('')
        setCaregivers([])
        setSelectedCaregiver(null)
        fetchCaregivers('')
    }

    const fetchCaregivers = async (search: string) => {
        setIsLoadingCaregivers(true)
        try {
            const data = await listCaregivers(search)
            setCaregivers(data)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsLoadingCaregivers(false)
        }
    }

    const handleCaregiverSearch = useCallback((search: string) => {
        setCaregiverSearch(search)
        fetchCaregivers(search)
    }, [])

    const handleAssignCaregiver = async () => {
        if (!patient || !selectedCaregiver) return
        setIsAssigningCaregiver(true)
        try {
            const updatedPatient = await assignCaregiver(patient._id, selectedCaregiver.id)
            setPatient(updatedPatient)
            toast.success('Caregiver assigned successfully')
            handleCaregiverModalClose()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsAssigningCaregiver(false)
        }
    }

    const handleConditionSearch = useCallback(
        async (query: string) => {
            if (!query.trim()) {
                setConditionSuggestions([])
                setIsSearchingConditions(false)
                return
            }

            setIsSearchingConditions(true)
            const results = await searchConditions(query)
            if (query.trim() === conditionQuery.trim()) {
                setConditionSuggestions(results)
            }
            setIsSearchingConditions(false)
        },
        [conditionQuery],
    )

    const handleConditionSelect = (selectedCondition: string) => {
        const matchedCondition = conditionSuggestions.find((condition) => condition.name === selectedCondition) ?? null
        if (!matchedCondition) {
            return
        }

        setSelectedConditions((current) => {
            if (current.some((condition) => condition.name === matchedCondition.name)) {
                return current
            }

            return [...current, matchedCondition]
        })
        setConditionQuery('')
        setConditionSuggestions([])
    }

    const handleConditionRemove = (conditionName: string) => {
        setSelectedConditions((current) => current.filter((condition) => condition.name !== conditionName))
    }

    const applyConditionUpdate = async () => {
        if (!patient || selectedConditions.length === 0 || !selectedSeverity) {
            return
        }

        setIsApplyingCondition(true)
        try {
            const updatedPatient = await updatePatientCondition(patient._id, {
                conditions: selectedConditions.map((condition) => condition.name),
                riskLevel: selectedSeverity,
            })
            setPatient(updatedPatient)
            toast.success('Condition and severity updated successfully')
            handleConditionModalClose()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsApplyingCondition(false)
        }
    }

    useEffect(() => {
        if (!showConditionModal) {
            resetConditionModal()
        }
    }, [showConditionModal])

    if (isLoading) {
        return (
            <DoctorLayout>
                <MainWrapper>
                    <div className="loading">Loading patient details...</div>
                </MainWrapper>
            </DoctorLayout>
        )
    }

    if (!patient) {
        return (
            <DoctorLayout>
                <MainWrapper>
                    <div className="error">Patient not found</div>
                </MainWrapper>
            </DoctorLayout>
        )
    }

    const vitalIcons: Record<string, ReactNode> = {
        blood_pressure: <Activity />,
        heart_rate: <Heart />,
        spo2: <Droplets />,
        blood_sugar: <Thermometer />,
    }
    const vitalNameFormat = (vital: string): string => {
        if (vital === 'blood_pressure') return 'Blood Pressure'
        else if (vital === 'heart_rate') return 'Heart Rate'
        else if (vital === 'spo2') return 'SPO2'
        else if (vital === 'blood_sugar') return 'Bloood Sugar'
        else return vital
    }

    const formatFrequency = (value: number, unit: 'hours' | 'days' | 'weeks') => {
        const label = value === 1 ? unit.slice(0, -1) : unit
        return `Every ${value} ${label}`
    }

    const formatDuration = (value: number, unit: 'hours' | 'days' | 'weeks' | 'months') => {
        const label = value === 1 ? unit.slice(0, -1) : unit
        return `${value} ${label}`
    }

    const handleCancelVitalPlan = async (planId: string) => {
        setCancellingPlanId(planId)
        try {
            await cancelPatientVitalPlan(planId)
            toast.success('Vitals check request removed')
            fetchPatient()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setCancellingPlanId(null)
        }
    }

    const handleClinicalStatusChange = async (clinicalStatus: string) => {
        if (!patient) return
        try {
            const updated = await updateClinicalStatus(patient._id, clinicalStatus)
            setPatient(updated.data)
            toast.success(updated.message)
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const handleMedicalRecord = () => {
        navigate(`/doctor/patients/${patientId}/medical-record`)
    }
    const flatVital = vitalPlans.flatMap((plan) => plan.vitals)

    const vitals = flatVital.map((vital) => vital.type)

    return (
        <DoctorLayout>
            <MainWrapper>
                <ProfileCard
                    name={patient.name}
                    age={patient.age}
                    gender={patient.gender}
                    patinetId={patient.patientId}
                    riskLevel={patient.riskLevel}
                    conditions={patient.conditions}
                    profileImage={patient.profileImage}
                    appointmentStatus={patient.appointmentStatus}
                    caregiver={patient.caregiver}
                    clinicalStatus={patient.clinicalStatus}
                    onClinicalStatusChange={handleClinicalStatusChange}
                    onStartConsultation={handleStartConsultation}
                    onCompleteConsultation={handleCompleteConsultation}
                    onAddCondition={() => {
                        resetConditionModal()
                        setShowConditionModal(true)
                    }}
                    onAssignCaregiver={handleCaregiverModalOpen}
                    onMedicalRecord={handleMedicalRecord}
                />
                <div className={styles.vitalsLogGrid}>
                    {patient.vitals.length > 0 &&
                        patient.vitals.map((vital) => (
                            <VitalCard
                                key={vital._id}
                                vitalName={vitalNameFormat(vital.type)}
                                value={vital.value?.toString() || `${vital.systolic}/${vital.diastolic}`}
                                unit={vital.unit}
                                icon={vitalIcons[vital.type]}
                                status={vital.recordedAt}
                            />
                        ))}
                </div>
                <Section title="Vitals Check Requests">
                    {vitalPlans.length === 0 ? (
                        <p className={styles.emptyVitalPlans}>No active vitals check requests.</p>
                    ) : (
                        <div className={styles.vitalPlansTable}>
                            <div className={styles.vitalsGrid}>
                                {vitalPlans.map((plan) => (
                                    <div key={plan._id} className={styles.vitalCard}>
                                        {plan.vitals.map((vital) => (
                                            <>
                                                <div className={styles.header}>
                                                    <span className={styles.vitalName}>
                                                        {vitalNameFormat(vital.type)}
                                                    </span>

                                                    <button
                                                        onClick={() => handleCancelVitalPlan(plan._id)}
                                                        className={styles.deleteButton}
                                                        disabled={cancellingPlanId === plan._id}
                                                    >
                                                        <Trash2 size={18} color="red" />
                                                    </button>
                                                </div>

                                                <div className={styles.details}>
                                                    <div className={styles.detailRow}>
                                                        <span className={styles.label}>Frequency</span>

                                                        <span className={styles.value}>
                                                            {formatFrequency(vital.frequencyValue, vital.frequencyUnit)}
                                                        </span>
                                                    </div>

                                                    <div className={styles.detailRow}>
                                                        <span className={styles.label}>Duration</span>

                                                        <span className={styles.value}>
                                                            {formatDuration(vital.durationValue, vital.durationUnit)}
                                                        </span>
                                                    </div>

                                                    <div className={styles.detailRow}>
                                                        <span className={styles.label}>Requested On</span>

                                                        <span className={styles.value}>
                                                            {new Date(plan.createdAt).toLocaleDateString('en-IN', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Section>
                <MedicationTable
                    patientId={patient._id}
                    patientName={patient.name}
                    clinicalStatus={patient.clinicalStatus}
                    prescriptions={patient.prescriptions}
                    hasConditions={(patient.conditions?.length ?? 0) > 0}
                    vitalPlan={vitals}
                    onSuccess={fetchPatient}
                />

                <Modal
                    isOpen={showConditionModal}
                    onClose={handleConditionModalClose}
                    title="Search Condition"
                    footer={
                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.closeBtn} onClick={handleConditionModalClose}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={styles.applyBtn}
                                onClick={applyConditionUpdate}
                                disabled={selectedConditions.length === 0 || !selectedSeverity || isApplyingCondition}
                            >
                                {isApplyingCondition ? 'Saving...' : 'Apply'}
                            </button>
                        </div>
                    }
                >
                    <div className={styles.modalBody}>
                        <div className={styles.searchWrapper}>
                            <SearchField
                                placeholder="Search condition..."
                                value={conditionQuery}
                                onChange={setConditionQuery}
                                onSearch={handleConditionSearch}
                                suggestions={conditionSuggestions.map((condition) => condition.name)}
                                isLoading={isSearchingConditions}
                                onSelect={handleConditionSelect}
                            />
                        </div>
                        {selectedConditions.length > 0 && (
                            <div className={styles.selectedCondition}>
                                <div className={styles.conditionChips}>
                                    {selectedConditions.map((condition) => (
                                        <button
                                            key={condition.name}
                                            type="button"
                                            className={styles.conditionChip}
                                            onClick={() => handleConditionRemove(condition.name)}
                                        >
                                            {condition.name}
                                            <span className={styles.conditionChipRemove}>x</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className={styles.severitySection}>
                            <span className={styles.severityLabel}>Overall Severity Level</span>
                            <div className={styles.severityOptions}>
                                {SEVERITY_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`${styles.severityBtn} ${
                                            selectedSeverity === option.value ? styles.severityBtnActive : ''
                                        }`}
                                        onClick={() => setSelectedSeverity(option.value)}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </Modal>

                <Modal
                    isOpen={showCaregiverModal}
                    onClose={handleCaregiverModalClose}
                    title="Assign Caregiver"
                    footer={
                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.closeBtn} onClick={handleCaregiverModalClose}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={styles.applyBtn}
                                onClick={handleAssignCaregiver}
                                disabled={!selectedCaregiver || isAssigningCaregiver}
                            >
                                {isAssigningCaregiver ? 'Assigning...' : 'Assign'}
                            </button>
                        </div>
                    }
                >
                    <div className={styles.modalBody}>
                        <div className={styles.searchWrapper}>
                            <SearchField
                                placeholder="Search caregiver..."
                                value={caregiverSearch}
                                onChange={setCaregiverSearch}
                                onSearch={handleCaregiverSearch}
                                suggestions={caregivers.map((cg) => cg.fullName)}
                                isLoading={isLoadingCaregivers}
                                onSelect={(name) => {
                                    const caregiver = caregivers.find((cg) => cg.fullName === name)
                                    setSelectedCaregiver(caregiver || null)
                                }}
                            />
                        </div>
                        {selectedCaregiver && (
                            <div className={styles.selectedCaregiver}>
                                <p>
                                    <strong>Selected:</strong> {selectedCaregiver.fullName}
                                </p>
                                <p>
                                    <strong>Email:</strong> {selectedCaregiver.email}
                                </p>
                                <p>
                                    <strong>Phone:</strong> {selectedCaregiver.phoneNumber}
                                </p>
                            </div>
                        )}
                    </div>
                </Modal>
            </MainWrapper>
        </DoctorLayout>
    )
}
export default PatientViewPage
