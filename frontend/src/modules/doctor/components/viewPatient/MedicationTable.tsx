import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'

import { addPrescription } from '../../api/doctor.api'
import { getMedicineNames, getMedicineStrengths } from '../../api/medicine.api'
import type { PatientPrescription } from '../../types/doctor.types'

import styles from './MedicationTable.module.css'

import Button from '@/shared/components/Button/Button'
import Modal from '@/shared/components/Modal/Modal'
import SearchField from '@/shared/components/SearchField/SearchField'
import { Section } from '@/shared/components/Section/Section'
import { getErrorMessage } from '@/utils/getErrorMessage'

interface ScheduleTime {
    id: string
    time: string
}

interface SelectedMedication {
    id: string
    name: string
    dosage: string
    type: string
    frequency: string
    duration: number
    durationUnit: string
    priority: string
    route: string
    scheduleTimes: ScheduleTime[]
}

interface MedicationProps {
    patientId: string
    clinicalStatus: string
    prescriptions: PatientPrescription[]
    hasConditions: boolean
    onSuccess: () => void
}

const MedicationTable = ({ patientId, prescriptions, hasConditions, onSuccess }: MedicationProps) => {
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)

    const activePrescriptions = prescriptions.filter((prescription) =>
        ['active', 'amended', 'on_hold'].includes(prescription.status),
    )

    const [medicationSearch, setMedicationSearch] = useState('')
    const [dosage, setDosage] = useState('')
    const [availableStrengths, setAvailableStrengths] = useState<string[]>([])
    const [selectedMedications, setSelectedMedications] = useState<SelectedMedication[]>([])
    const [instructions, setInstructions] = useState('')
    const [medicineSuggestions, setMedicineSuggestions] = useState<string[]>([])
    const [isSearchingMedicines, setIsSearchingMedicines] = useState(false)
    const [selectedMedicineName, setSelectedMedicineName] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const handleRemoveMedication = (id: string) => {
        setSelectedMedications(selectedMedications.filter((med) => med.id !== id))
    }

    const handleAddScheduleTime = (medicationId: string) => {
        setSelectedMedications(
            selectedMedications.map((med) => {
                if (med.id === medicationId) {
                    return {
                        ...med,
                        scheduleTimes: [...med.scheduleTimes, { id: Date.now().toString(), time: '' }],
                    }
                }
                return med
            }),
        )
    }

    const handleUpdateScheduleTime = (medicationId: string, timeId: string, newTime: string) => {
        setSelectedMedications(
            selectedMedications.map((med) => {
                if (med.id === medicationId) {
                    return {
                        ...med,
                        scheduleTimes: med.scheduleTimes.map((time) =>
                            time.id === timeId ? { ...time, time: newTime } : time,
                        ),
                    }
                }
                return med
            }),
        )
    }

    const handleRemoveScheduleTime = (medicationId: string, timeId: string) => {
        setSelectedMedications(
            selectedMedications.map((med) => {
                if (med.id === medicationId) {
                    return {
                        ...med,
                        scheduleTimes: med.scheduleTimes.filter((time) => time.id !== timeId),
                    }
                }
                return med
            }),
        )
    }

    const handleMedicineSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setMedicineSuggestions([])
            setIsSearchingMedicines(false)
            return
        }

        setIsSearchingMedicines(true)
        try {
            const results = await getMedicineNames(query)
            setMedicineSuggestions(results)
        } catch (error) {
            console.error('Error searching medicines:', error)
            setMedicineSuggestions([])
        } finally {
            setIsSearchingMedicines(false)
        }
    }, [])

    const handleMedicineSelect = async (medicineName: string) => {
        setSelectedMedicineName(medicineName)
        setMedicationSearch(medicineName)
        setMedicineSuggestions([])

        try {
            setIsSearchingMedicines(true)
            const strengths = await getMedicineStrengths(medicineName)
            setAvailableStrengths(strengths)
            if (strengths.length > 0) {
                setDosage(strengths[0])
            }
        } catch (error) {
            console.error('Error fetching strengths:', error)
            setAvailableStrengths([])
        } finally {
            setIsSearchingMedicines(false)
        }
    }

    const handleAddMedicationToList = () => {
        if (!selectedMedicineName) return

        const newMedication: SelectedMedication = {
            id: Date.now().toString(),
            name: selectedMedicineName,
            dosage: dosage,
            type: 'Oral Pill',
            frequency: 'Once daily',
            duration: 7,
            durationUnit: 'Days',
            priority: 'Medium',
            route: 'Oral',
            scheduleTimes: [{ id: '1', time: '08:00 AM' }],
        }

        setSelectedMedications([...selectedMedications, newMedication])
        setSelectedMedicineName('')
        setMedicationSearch('')
        setDosage('')
        setAvailableStrengths([])
    }

    const handleUpdateMedicationField = (
        medicationId: string,
        field: keyof SelectedMedication,
        value: string | number,
    ) => {
        setSelectedMedications(
            selectedMedications.map((med) => {
                if (med.id === medicationId) {
                    return { ...med, [field]: value }
                }
                return med
            }),
        )
    }

    const handleAddPrescription = async () => {
        if (!patientId || selectedMedications.length === 0) return

        setIsSaving(true)
        try {
            await addPrescription(patientId, {
                medications: selectedMedications.map((med) => ({
                    name: med.name,
                    dosage: med.dosage,
                    route:
                        med.route === 'Intravenous'
                            ? 'IV'
                            : med.route === 'Intramuscular'
                              ? 'injection'
                              : med.route.toLowerCase(),
                    frequency: med.frequency,
                    scheduleTimes: med.scheduleTimes.map((t) => t.time).filter(Boolean),
                    isCritical: med.priority === 'Critical',
                })),
                note: instructions,
            })
            toast.success('Prescription added successfully')
            onSuccess()
            handleClosePrescriptionModal()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsSaving(false)
        }
    }

    const handleClosePrescriptionModal = () => {
        setShowPrescriptionModal(false)
        setMedicationSearch('')
        setDosage('')
        setAvailableStrengths([])
        setSelectedMedicineName('')
        setSelectedMedications([])
        setInstructions('')
        setMedicineSuggestions([])
    }

    const footerContent = (
        <div className={styles.modalFooter}>
            <button className={styles.cancelBtn} onClick={handleClosePrescriptionModal} type="button">
                Cancel
            </button>
            <button
                className={styles.addPrescriptionBtn}
                onClick={handleAddPrescription}
                disabled={selectedMedications.length === 0 || isSaving}
                type="button"
            >
                {isSaving ? 'Saving...' : 'Add Prescription'}
            </button>
        </div>
    )

    return (
        <>
            <Section
                title="Current Medication"
                actions={
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                            disabled={!hasConditions}
                            onClick={() => setShowPrescriptionModal(true)}
                            style={{
                                padding: '8px 20px',
                                opacity: hasConditions ? 1 : 0.5,
                                cursor: hasConditions ? 'pointer' : 'not-allowed',
                            }}
                        >
                            Prescription
                        </Button>
                        <Button
                            disabled={!hasConditions}
                            style={{
                                padding: '8px 20px',
                                opacity: hasConditions ? 1 : 0.5,
                                cursor: hasConditions ? 'pointer' : 'not-allowed',
                            }}
                        >
                            Vitals
                        </Button>
                    </div>
                }
            >
                {activePrescriptions.length === 0 ? (
                    <p style={{ margin: 0, color: '#64748b' }}>No prescriptions available for this patient.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {activePrescriptions.map((prescription) => (
                            <div
                                key={prescription._id}
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '14px',
                                    padding: '16px',
                                    background: '#fff',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginBottom: '12px',
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <strong style={{ color: '#0f172a' }}>
                                        {prescription.status.replace('_', ' ')}
                                    </strong>
                                    <span style={{ color: '#64748b', fontSize: '14px' }}>
                                        Prescribed {new Date(prescription.prescribedAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {prescription.medications.map((medication, index) => (
                                        <div
                                            key={`${prescription._id}-${medication.name}-${index}`}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '12px',
                                                background: medication.isCritical ? '#fff7ed' : '#f8fafc',
                                                border: `1px solid ${medication.isCritical ? '#fdba74' : '#e2e8f0'}`,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    gap: '12px',
                                                    flexWrap: 'wrap',
                                                }}
                                            >
                                                <strong>{medication.name}</strong>
                                                <span style={{ color: medication.isCritical ? '#c2410c' : '#475569' }}>
                                                    {medication.isCritical ? 'Critical' : medication.route}
                                                </span>
                                            </div>
                                            <p style={{ margin: '8px 0 0', color: '#475569' }}>
                                                {medication.dosage} • {medication.frequency}
                                            </p>
                                            {medication.scheduleTimes.length > 0 && (
                                                <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '14px' }}>
                                                    Times: {medication.scheduleTimes.join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {prescription.note && (
                                    <p style={{ margin: '12px 0 0', color: '#475569' }}>Note: {prescription.note}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Section>

            <Modal
                isOpen={showPrescriptionModal}
                onClose={handleClosePrescriptionModal}
                title="Prescription"
                size="lg"
                footer={footerContent}
            >
                <div className={styles.modalContent}>
                    <div className={styles.searchSection}>
                        <div className={styles.searchField}>
                            <label className={styles.searchLabel}>Search Medication</label>
                            <SearchField
                                placeholder="Start typing medication name (e.g. Amoxicillin)"
                                value={medicationSearch}
                                onChange={setMedicationSearch}
                                onSearch={handleMedicineSearch}
                                suggestions={medicineSuggestions}
                                isLoading={isSearchingMedicines}
                                onSelect={handleMedicineSelect}
                            />
                        </div>
                        <div className={styles.dosageField}>
                            <label className={styles.dosageLabel}>Dosage</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select
                                    className={styles.dosageSelect}
                                    value={dosage}
                                    onChange={(e) => setDosage(e.target.value)}
                                    disabled={availableStrengths.length === 0}
                                >
                                    <option value="" disabled>
                                        Select dosage
                                    </option>
                                    {availableStrengths.map((strength, index) => (
                                        <option key={index} value={strength}>
                                            {strength}
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    onClick={handleAddMedicationToList}
                                    disabled={!selectedMedicineName || !dosage}
                                    style={{ padding: '8px 16px' }}
                                >
                                    Add
                                </Button>
                            </div>
                        </div>
                    </div>

                    {selectedMedications.length > 0 && (
                        <div className={styles.selectedMedicationsSection}>
                            <h3 className={styles.selectedMedicationsTitle}>
                                Selected Medications ({selectedMedications.length})
                            </h3>

                            {selectedMedications.map((medication) => (
                                <div key={medication.id} className={styles.medicationCard}>
                                    <div className={styles.medicationHeader}>
                                        <div>
                                            <h4 className={styles.medicationName}>
                                                {medication.name} ({medication.dosage})
                                            </h4>
                                            <p className={styles.medicationSubtitle}>{medication.type}</p>
                                        </div>
                                        <button
                                            className={styles.medicationRemoveBtn}
                                            onClick={() => handleRemoveMedication(medication.id)}
                                            type="button"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className={styles.medicationGrid}>
                                        <div className={styles.fieldGroup}>
                                            <label className={styles.fieldLabel}>Frequency</label>
                                            <select
                                                className={styles.fieldSelect}
                                                value={medication.frequency}
                                                onChange={(e) =>
                                                    handleUpdateMedicationField(
                                                        medication.id,
                                                        'frequency',
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                <option>Once daily</option>
                                                <option>Twice daily</option>
                                                <option>Three times daily</option>
                                                <option>Four times daily</option>
                                            </select>
                                        </div>
                                        <div className={styles.fieldGroup}>
                                            <label className={styles.fieldLabel}>Duration</label>
                                            <div className={styles.durationContainer}>
                                                <input
                                                    type="number"
                                                    className={`${styles.fieldInput} ${styles.durationInput}`}
                                                    value={medication.duration}
                                                    onChange={(e) =>
                                                        handleUpdateMedicationField(
                                                            medication.id,
                                                            'duration',
                                                            parseInt(e.target.value) || 0,
                                                        )
                                                    }
                                                />
                                                <select
                                                    className={`${styles.fieldSelect} ${styles.durationUnit}`}
                                                    value={medication.durationUnit}
                                                    onChange={(e) =>
                                                        handleUpdateMedicationField(
                                                            medication.id,
                                                            'durationUnit',
                                                            e.target.value,
                                                        )
                                                    }
                                                >
                                                    <option>Days</option>
                                                    <option>Weeks</option>
                                                    <option>Months</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.medicationGrid}>
                                        <div className={styles.fieldGroup}>
                                            <label className={`${styles.fieldLabel} ${styles.required}`}>
                                                Medication Priority
                                            </label>
                                            <select
                                                className={styles.fieldSelect}
                                                value={medication.priority}
                                                onChange={(e) =>
                                                    handleUpdateMedicationField(
                                                        medication.id,
                                                        'priority',
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                <option>Critical</option>
                                                <option>High</option>
                                                <option>Medium</option>
                                                <option>Low</option>
                                            </select>
                                        </div>
                                        <div className={styles.fieldGroup}>
                                            <label className={styles.fieldLabel}>Administration Route</label>
                                            <select
                                                className={styles.fieldSelect}
                                                value={medication.route}
                                                onChange={(e) =>
                                                    handleUpdateMedicationField(medication.id, 'route', e.target.value)
                                                }
                                            >
                                                <option value="Oral">Oral</option>
                                                <option value="Intravenous">Intravenous (IV)</option>
                                                <option value="Intramuscular">Injection</option>
                                                <option value="Inhalation">Inhalation</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className={styles.scheduleTimesSection}>
                                        <label className={styles.scheduleTimesLabel}>Schedule Times</label>
                                        <div className={styles.scheduleTimesList}>
                                            {medication.scheduleTimes.map((time) => (
                                                <div key={time.id} className={styles.scheduleTimeItem}>
                                                    <input
                                                        type="time"
                                                        className={styles.timeInput}
                                                        value={time.time}
                                                        onChange={(e) =>
                                                            handleUpdateScheduleTime(
                                                                medication.id,
                                                                time.id,
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <button
                                                        className={styles.removeTimeBtn}
                                                        onClick={() => handleRemoveScheduleTime(medication.id, time.id)}
                                                        type="button"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                className={styles.addTimeBtn}
                                                onClick={() => handleAddScheduleTime(medication.id)}
                                                type="button"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={styles.instructionsSection}>
                        <label className={styles.instructionsLabel}>Instructions for Pharmacist / Patient</label>
                        <textarea
                            className={styles.instructionsInput}
                            placeholder="e.g. Take with food, finish the entire course"
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>
        </>
    )
}
export default MedicationTable
