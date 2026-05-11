import { Heart, Activity, Thermometer, Droplets } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'

import { getPatientById, startConsultation, updatePatientCondition } from '../api/doctor.api'
import MedicationTable from '../components/viewPatient/MedicationTable'
import ProfileCard from '../components/viewPatient/ProfileCard'
import VitalCard from '../components/viewPatient/VitalCard'
import type { PatientDetails, PatientSeverityLevel } from '../types/doctor.types'

import styles from './PatientViewPage.module.css'

import DoctorLayout from '@/layout/DoctorLayout'
import { type ConditionResult, searchConditions } from '@/modules/doctor/api/conditionsApi'
import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import Modal from '@/shared/components/Modal/Modal'
import SearchField from '@/shared/components/SearchField/SearchField'
import { getErrorMessage } from '@/utils/getErrorMessage'

const getLatestVital = (patient: PatientDetails, type: PatientDetails['vitals'][number]['type']) => {
    return patient.vitals
        .filter((vital) => vital.type === type)
        .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0]
}

const SEVERITY_OPTIONS: Array<{ label: string; value: PatientSeverityLevel }> = [
    { label: 'Mild', value: 'mild' },
    { label: 'Moderate', value: 'moderate' },
    { label: 'Severe', value: 'severe' },
    { label: 'High Risk', value: 'high_risk' },
]

const PatientViewPage = () => {
    const { patientId } = useParams<{ patientId: string }>()
    const [patient, setPatient] = useState<PatientDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showConditionModal, setShowConditionModal] = useState(false)
    const [conditionQuery, setConditionQuery] = useState('')
    const [selectedConditions, setSelectedConditions] = useState<ConditionResult[]>([])
    const [selectedSeverity, setSelectedSeverity] = useState<PatientSeverityLevel | ''>('')
    const [conditionSuggestions, setConditionSuggestions] = useState<ConditionResult[]>([])
    const [isSearchingConditions, setIsSearchingConditions] = useState(false)
    const [isApplyingCondition, setIsApplyingCondition] = useState(false)

    const fetchPatient = useCallback(async () => {
        if (!patientId) return
        setIsLoading(true)
        try {
            const data = await getPatientById(patientId)
            setPatient(data)
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

    const resetConditionModal = () => {
        setConditionQuery('')
        setSelectedConditions(
            (patient?.conditions ?? []).map((condition) => ({
                name: condition,
                code: condition,
            })),
        )
        setSelectedSeverity((patient?.riskLevel as PatientSeverityLevel | undefined) ?? '')
        setConditionSuggestions([])
        setIsSearchingConditions(false)
    }

    const handleConditionModalClose = () => {
        resetConditionModal()
        setShowConditionModal(false)
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

    const heartRate = getLatestVital(patient, 'heart_rate')
    const bloodPressure = getLatestVital(patient, 'blood_pressure')
    const spo2 = getLatestVital(patient, 'spo2')
    const bloodSugar = getLatestVital(patient, 'blood_sugar')

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
                    onStartConsultation={handleStartConsultation}
                    onAddCondition={() => setShowConditionModal(true)}
                    isConditionEditable={false}
                />
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginTop: '20px',
                    }}
                >
                    <VitalCard
                        icon={<Heart />}
                        vitalName="Heart Rate"
                        value={heartRate?.value?.toString() ?? '--'}
                        unit={heartRate?.unit ?? 'bpm'}
                        status={heartRate ? 'Recorded' : 'No data'}
                    />
                    <VitalCard
                        icon={<Activity />}
                        vitalName="Blood Pressure"
                        value={
                            bloodPressure?.systolic !== undefined && bloodPressure?.diastolic !== undefined
                                ? `${bloodPressure.systolic}/${bloodPressure.diastolic}`
                                : '--'
                        }
                        unit={bloodPressure?.unit ?? 'mmHg'}
                        status={bloodPressure ? 'Recorded' : 'No data'}
                    />
                    <VitalCard
                        icon={<Droplets />}
                        vitalName="SpO2"
                        value={spo2?.value?.toString() ?? '--'}
                        unit={spo2?.unit ?? '%'}
                        status={spo2 ? 'Recorded' : 'No data'}
                    />
                    <VitalCard
                        icon={<Thermometer />}
                        vitalName="Blood Sugar"
                        value={bloodSugar?.value?.toString() ?? '--'}
                        unit={bloodSugar?.unit ?? 'mg/dL'}
                        status={bloodSugar ? 'Recorded' : 'No data'}
                    />
                </div>
                <MedicationTable
                    patientId={patient._id}
                    clinicalStatus={patient.clinicalStatus}
                    prescriptions={patient.prescriptions}
                    hasConditions={(patient.conditions?.length ?? 0) > 0}
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
            </MainWrapper>
        </DoctorLayout>
    )
}
export default PatientViewPage
