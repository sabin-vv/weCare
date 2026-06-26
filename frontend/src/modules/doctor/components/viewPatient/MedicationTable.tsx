import { Activity, Droplets, Heart, OctagonMinus, Pencil } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import {
    addPrescription,
    createVitalPlan,
    getPatientPrescriptions,
    updatePrescriptionStatus,
} from '../../api/doctor.api'
import { getMedicineNames, getMedicineStrengths } from '../../api/medicine.api'
import { ADMINISTRATION_ROUTE, DURATION, FREQUENCY, MEDICAL_PRIORITY } from '../../constants/prescriptions.Constants'
import type { MedicationProps, PatientPrescription, ScheduleTime, SelectedMedication } from '../../types/doctor.types'

import styles from './MedicationTable.module.css'

import Button from '@/shared/components/Button/Button'
import Modal from '@/shared/components/Modal/Modal'
import Pagination from '@/shared/components/Pagination/Pagination'
import SearchField from '@/shared/components/SearchField/SearchField'
import { Section } from '@/shared/components/Section/Section'
import SelectField from '@/shared/components/SelectField/SelectField'
import DataTable from '@/shared/components/Table/DataTable'
import type { Column } from '@/shared/components/Table/dataTable.types'
import { getErrorMessage } from '@/utils/getErrorMessage'

type VitalPlanOptionId = 'blood_pressure' | 'heart_rate' | 'spo2' | 'blood_sugar'

const getFrequencySlotCount = (frequency: string) => {
    const map: Record<string, number> = {
        'Once daily': 1,
        'Twice daily': 2,
        'Three times daily': 3,
        'Four times daily': 4,
    }

    return map[frequency] ?? 1
}

const createScheduleTime = (medicationId: string, index: number): ScheduleTime => ({
    id: `${medicationId}-schedule-${index}-${Date.now()}`,
    time: '',
})

const normalizeScheduleTimes = (
    medicationId: string,
    frequency: string,
    scheduleTimes: ScheduleTime[],
): ScheduleTime[] => {
    const requiredCount = getFrequencySlotCount(frequency)
    const normalizedTimes = scheduleTimes.slice(0, requiredCount)

    while (normalizedTimes.length < requiredCount) {
        normalizedTimes.push(createScheduleTime(medicationId, normalizedTimes.length))
    }

    return normalizedTimes
}

const PAGE_LIMIT = 8

const MedicationTable = ({ patientId, patientName, hasConditions, onSuccess, vitalPlan }: MedicationProps) => {
    const [prescriptions, setPrescriptions] = useState<PatientPrescription[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false)
    const [prescriptionRefreshKey, setPrescriptionRefreshKey] = useState(0)
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
    const [showVitalsModal, setShowVitalsModal] = useState(false)
    const [editingPrescription, setEditingPrescription] = useState<PatientPrescription | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [originalPrescription, setOriginalPrescription] = useState<SelectedMedication[]>([])

    const fetchPrescriptions = useCallback(async () => {
        setIsLoadingPrescriptions(true)
        try {
            const response = await getPatientPrescriptions(patientId, page, PAGE_LIMIT)
            setPrescriptions(response.data)
            setTotalPages(response.pagination.totalPages)
            setTotalCount(response.pagination.total)
        } catch (error) {
            toast.error(getErrorMessage(error))
            setPrescriptions([])
        } finally {
            setIsLoadingPrescriptions(false)
        }
    }, [patientId, page])

    useEffect(() => {
        if (patientId) {
            fetchPrescriptions()
        }
    }, [fetchPrescriptions, patientId, prescriptionRefreshKey])

    const flattenedMedications = [...prescriptions]
        .sort((a, b) => new Date(b.prescribedAt).getTime() - new Date(a.prescribedAt).getTime())
        .flatMap((prescription) =>
            prescription.medications.map((med) => ({
                prescriptionId: prescription._id,
                prescriptionStatus: prescription.status,
                prescribedAt: prescription.prescribedAt,
                ...med,
            })),
        )

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'active':
                return styles.statusActive
            case 'on_hold':
                return styles.statusOnHold
            case 'amended':
                return styles.statusAmended
            case 'completed':
                return styles.statusCompleted
            case 'discontinued':
                return styles.statusDiscontinued
            default:
                return ''
        }
    }

    const medicationColumns: Column<(typeof flattenedMedications)[number]>[] = [
        {
            header: 'Medication',
            key: 'name' as keyof (typeof flattenedMedications)[number],
            render: (item) => <span className={styles.medicationCell}>{item.name}</span>,
        },
        {
            header: 'Dosage',
            key: 'dosage' as keyof (typeof flattenedMedications)[number],
            render: (item) => item.dosage,
        },
        {
            header: 'Frequency',
            key: 'frequency' as keyof (typeof flattenedMedications)[number],
            render: (item) => item.frequency,
        },
        {
            header: 'Schedule Times',
            key: 'scheduleTimes' as keyof (typeof flattenedMedications)[number],
            render: (item) =>
                item.scheduleTimes.length > 0 ? (
                    <div className={styles.scheduleTimeChips}>
                        {item.scheduleTimes.map((time, index) => (
                            <span
                                key={`${item.prescriptionId}-${item.name}-${time}-${index}`}
                                className={styles.scheduleTimeChip}
                            >
                                {time}
                            </span>
                        ))}
                    </div>
                ) : (
                    'N/A'
                ),
        },
        {
            header: 'End Time',
            key: 'endDate' as keyof (typeof flattenedMedications)[number],
            render: (item) =>
                item.endDate
                    ? new Date(item.endDate).toLocaleString([], {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                      })
                    : 'N/A',
        },
        {
            header: 'Status',
            key: 'prescriptionStatus' as keyof (typeof flattenedMedications)[number],
            render: (item) => (
                <span className={`${styles.statusBadge} ${getStatusClass(item.prescriptionStatus)}`}>
                    {item.prescriptionStatus.replace('_', ' ')}
                </span>
            ),
        },
        {
            header: 'Actions',
            key: 'prescriptionId' as keyof (typeof flattenedMedications)[number],
            render: (item) => {
                if (item.prescriptionStatus !== 'active') return null

                const prescription = prescriptions.find((p) => p._id === item.prescriptionId)
                return (
                    <div className={styles.actionButtons}>
                        <button
                            className={styles.actionIconBtn}
                            title="Edit"
                            onClick={() => handleEditPrescription(prescription)}
                        >
                            <Pencil size={18} className={styles.editIcon} />
                        </button>
                        <button
                            className={`${styles.actionIconBtn} ${styles.deleteBtn}`}
                            title="Delete"
                            onClick={() => handleDeletePrescription(prescription)}
                        >
                            <OctagonMinus size={18} className={styles.deleteIcon} />
                        </button>
                    </div>
                )
            },
        },
    ]

    const [medicationSearch, setMedicationSearch] = useState('')
    const [dosage, setDosage] = useState('')
    const [availableStrengths, setAvailableStrengths] = useState<string[]>([])
    const [selectedMedications, setSelectedMedications] = useState<SelectedMedication[]>([])
    const [medicineSuggestions, setMedicineSuggestions] = useState<string[]>([])
    const [isSearchingMedicines, setIsSearchingMedicines] = useState(false)
    const [selectedMedicineName, setSelectedMedicineName] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isSavingVitalPlan, setIsSavingVitalPlan] = useState(false)
    const [selectedVitals, setSelectedVitals] = useState<VitalPlanOptionId[]>([])
    const [vitalsInstructions, setVitalsInstructions] = useState('')
    const [vitalsPreferences, setVitalsPreferences] = useState<
        Record<VitalPlanOptionId, { frequency: string; duration: string }>
    >({
        blood_pressure: { frequency: 'Every 2 hours', duration: 'Next 24 hours' },
        heart_rate: { frequency: 'Every 2 hours', duration: 'Next 24 hours' },
        spo2: { frequency: 'Every 2 hours', duration: 'Next 24 hours' },
        blood_sugar: { frequency: 'Every 2 hours', duration: 'Next 24 hours' },
    })

    const vitalOptions = [
        {
            id: 'blood_pressure',
            label: 'Blood Pressure',
            icon: <Activity size={18} />,
            iconClassName: styles.vitalOptionIconBlue,
        },
        {
            id: 'heart_rate',
            label: 'Heart Rate',
            icon: <Heart size={18} />,
            iconClassName: styles.vitalOptionIconRed,
        },
        {
            id: 'spo2',
            label: 'SpO2',
            icon: <Activity size={18} />,
            iconClassName: styles.vitalOptionIconGreen,
        },
        {
            id: 'blood_sugar',
            label: 'Blood Sugar',
            icon: <Droplets size={18} />,
            iconClassName: styles.vitalOptionIconPurple,
        },
    ] as const

    const frequencyOptions = ['Every 1 hour', 'Every 2 hours', 'Every 6 hours', 'Every 1 day', 'Every 1 week']
    const durationOptions = ['Next 12 hours', 'Next 24 hours', 'Next 48 hours', 'For 7 days', 'For 4 weeks']

    const handleRemoveMedication = (id: string) => {
        setSelectedMedications(selectedMedications.filter((med) => med.id !== id))
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

    const handleEditPrescription = async (prescription: PatientPrescription | undefined) => {
        if (!prescription || prescription.medications.length === 0) return
        setEditingPrescription(prescription)
        setIsEditMode(true)

        const firstMed = prescription.medications[0]

        const mappedMedications: SelectedMedication[] = prescription.medications.map((med, index) => {
            const medicationId = `${prescription._id}-${index}`
            const scheduleTimes = med.scheduleTimes.map((time, i) => ({
                id: `${medicationId}-${i}`,
                time: time,
            }))

            return {
                id: medicationId,
                name: med.name,
                dosage: med.dosage,
                frequency: med.frequency,
                duration: med.duration || 7,
                durationUnit: med.durationUnit || 'Days',
                priority: med.priority || '',
                route: med.route === 'IV' ? 'Intravenous' : med.route === 'injection' ? 'Intramuscular' : med.route,
                scheduleTimes: normalizeScheduleTimes(medicationId, med.frequency, scheduleTimes),
                instructions: med.instructions || '',
            }
        })

        setSelectedMedications(mappedMedications)
        setOriginalPrescription([...mappedMedications])
        setMedicationSearch(firstMed.name)
        setSelectedMedicineName(firstMed.name)

        try {
            setIsSearchingMedicines(true)
            const strengths = await getMedicineStrengths(firstMed.name)
            setAvailableStrengths(strengths)
            if (strengths.includes(firstMed.dosage)) {
                setDosage(firstMed.dosage)
            } else if (strengths.length > 0) {
                setDosage(strengths[0])
            }
        } catch (error) {
            console.error('Error fetching strengths:', error)
            setAvailableStrengths([])
        } finally {
            setIsSearchingMedicines(false)
        }

        setShowPrescriptionModal(true)
    }

    const handleDeletePrescription = async (prescription: PatientPrescription | undefined) => {
        if (!prescription) return

        try {
            await updatePrescriptionStatus(prescription._id, 'discontinued')
            toast.success('Prescription discontinued')
            onSuccess()
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
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

        const medicationId = Date.now().toString()
        const frequency = 'Once daily'
        const newMedication: SelectedMedication = {
            id: medicationId,
            name: selectedMedicineName,
            dosage: dosage,
            frequency,
            duration: 7,
            durationUnit: 'Days',
            priority: 'Medium',
            route: 'Oral',
            scheduleTimes: normalizeScheduleTimes(medicationId, frequency, []),
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
                    if (field === 'frequency' && typeof value === 'string') {
                        return {
                            ...med,
                            frequency: value,
                            scheduleTimes: normalizeScheduleTimes(med.id, value, med.scheduleTimes),
                        }
                    }

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
                    priority: med.priority,
                    instructions: med.instructions,
                    duration: med.duration,
                    durationUnit: med.durationUnit,
                })),
            })

            if (isEditMode && editingPrescription) {
                await updatePrescriptionStatus(editingPrescription._id, 'amended')
                toast.success('Prescription updated successfully')
            } else {
                toast.success('Prescription added successfully')
            }

            setPage(1)
            setPrescriptionRefreshKey((k) => k + 1)
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
        setMedicineSuggestions([])
        setEditingPrescription(null)
        setIsEditMode(false)
        setOriginalPrescription([])
    }

    const handleOpenVitalsModal = () => {
        setShowVitalsModal(true)
    }

    const handleCloseVitalsModal = () => {
        setShowVitalsModal(false)
        setSelectedVitals([])
        setVitalsInstructions('')
        setVitalsPreferences({
            blood_pressure: { frequency: 'Every 2 hours', duration: 'Next 24 hours' },
            heart_rate: { frequency: 'Every 2 hours', duration: 'Next 24 hours' },
            spo2: { frequency: 'Every 2 hours', duration: 'Next 24 hours' },
            blood_sugar: { frequency: 'Every 2 hours', duration: 'Next 24 hours' },
        })
    }

    const handleToggleVital = (vitalId: VitalPlanOptionId) => {
        setSelectedVitals((current) =>
            current.includes(vitalId) ? current.filter((id) => id !== vitalId) : [...current, vitalId],
        )
    }

    const handleUpdateVitalPreference = (
        vitalId: VitalPlanOptionId,
        field: 'frequency' | 'duration',
        value: string,
    ) => {
        setVitalsPreferences((current) => ({
            ...current,
            [vitalId]: {
                ...current[vitalId],
                [field]: value,
            },
        }))
    }

    const parseFrequency = (value: string): { frequencyValue: number; frequencyUnit: 'hours' | 'days' | 'weeks' } => {
        const match = value.match(/Every (\d+) (hour|hours|day|days|week|weeks)/i)
        if (!match) {
            return { frequencyValue: 2, frequencyUnit: 'hours' }
        }

        const unitMap = {
            hour: 'hours',
            hours: 'hours',
            day: 'days',
            days: 'days',
            week: 'weeks',
            weeks: 'weeks',
        } as const

        return {
            frequencyValue: Number(match[1]),
            frequencyUnit: unitMap[match[2].toLowerCase() as keyof typeof unitMap],
        }
    }

    const parseDuration = (
        value: string,
    ): { durationValue: number; durationUnit: 'hours' | 'days' | 'weeks' | 'months' } => {
        const match = value.match(/(?:Next|For) (\d+) (hour|hours|day|days|week|weeks|month|months)/i)
        if (!match) {
            return { durationValue: 24, durationUnit: 'hours' }
        }

        const unitMap = {
            hour: 'hours',
            hours: 'hours',
            day: 'days',
            days: 'days',
            week: 'weeks',
            weeks: 'weeks',
            month: 'months',
            months: 'months',
        } as const

        return {
            durationValue: Number(match[1]),
            durationUnit: unitMap[match[2].toLowerCase() as keyof typeof unitMap],
        }
    }

    const handleConfirmVitalsRequest = async () => {
        if (!patientId || selectedVitals.length === 0) return

        setIsSavingVitalPlan(true)
        try {
            await createVitalPlan(patientId, {
                vitals: selectedVitals.map((vitalId) => ({
                    type: vitalId,
                    ...parseFrequency(vitalsPreferences[vitalId].frequency),
                    ...parseDuration(vitalsPreferences[vitalId].duration),
                })),
                instructions: vitalsInstructions.trim() || undefined,
            })
            onSuccess()

            toast.success('Vitals check request created')
            handleCloseVitalsModal()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsSavingVitalPlan(false)
        }
    }

    const hasChanges = isEditMode && JSON.stringify(selectedMedications) !== JSON.stringify(originalPrescription)

    const hasValidScheduleTimes = selectedMedications.every(
        (med) => med.scheduleTimes.length > 0 && med.scheduleTimes.every((t) => t.time && t.time.trim() !== ''),
    )

    const footerContent = (
        <div className={styles.modalFooter}>
            <button className={styles.cancelBtn} onClick={handleClosePrescriptionModal} type="button">
                Cancel
            </button>
            <button
                className={styles.addPrescriptionBtn}
                onClick={handleAddPrescription}
                disabled={
                    selectedMedications.length === 0 ||
                    isSaving ||
                    !hasValidScheduleTimes ||
                    (isEditMode && !hasChanges)
                }
                type="button"
            >
                {isSaving ? 'Saving...' : isEditMode ? 'Update Prescription' : 'Add Prescription'}
            </button>
        </div>
    )

    return (
        <>
            <Section
                title="Current Medication"
                actions={
                    <div className={styles.sectionActions}>
                        <Button
                            disabled={!hasConditions}
                            onClick={() => setShowPrescriptionModal(true)}
                            className={styles.prescriptionBtn}
                        >
                            Prescription
                        </Button>
                        <Button disabled={!hasConditions} className={styles.vitalsBtn} onClick={handleOpenVitalsModal}>
                            Vitals
                        </Button>
                    </div>
                }
            >
                {flattenedMedications.length === 0 && !isLoadingPrescriptions ? (
                    <p className={styles.emptyMessage}>No prescriptions available for this patient.</p>
                ) : (
                    <div className={styles.tableSection}>
                        <DataTable
                            data={flattenedMedications}
                            columns={medicationColumns}
                            keyExtractor={(item) => `${item.prescriptionId}-${item.name}`}
                            isLoading={isLoadingPrescriptions}
                        >
                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    totalCount={totalCount}
                                    limit={PAGE_LIMIT}
                                    onPageChange={setPage}
                                />
                            )}
                        </DataTable>
                    </div>
                )}
            </Section>

            <Modal
                isOpen={showPrescriptionModal}
                onClose={handleClosePrescriptionModal}
                title={isEditMode ? 'Edit Prescription' : 'Prescription'}
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
                                onSearch={isEditMode ? undefined : handleMedicineSearch}
                                suggestions={isEditMode ? [] : medicineSuggestions}
                                isLoading={isEditMode ? false : isSearchingMedicines}
                                onSelect={isEditMode ? undefined : handleMedicineSelect}
                                disabled={isEditMode}
                            />
                        </div>
                        <div className={styles.dosageField}>
                            <label className={styles.dosageLabel}>Dosage</label>

                            <div className={styles.dosageRow}>
                                <SelectField
                                    options={availableStrengths.map((s) => ({ label: s, value: s }))}
                                    value={dosage}
                                    onChange={(e) => {
                                        setDosage(e.target.value)
                                        if (isEditMode && selectedMedications.length > 0) {
                                            setSelectedMedications(
                                                selectedMedications.map((med, i) =>
                                                    i === 0 ? { ...med, dosage: e.target.value } : med,
                                                ),
                                            )
                                        }
                                    }}
                                    disabled={availableStrengths.length === 0}
                                />

                                {!isEditMode && (
                                    <Button
                                        onClick={handleAddMedicationToList}
                                        disabled={!selectedMedicineName || !dosage}
                                        className={styles.addMedicationBtn}
                                    >
                                        Add
                                    </Button>
                                )}
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
                                            <SelectField
                                                label="Frequency"
                                                options={FREQUENCY}
                                                value={medication.frequency}
                                                onChange={(e) =>
                                                    handleUpdateMedicationField(
                                                        medication.id,
                                                        'frequency',
                                                        e.target.value,
                                                    )
                                                }
                                            />
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
                                                <SelectField
                                                    options={DURATION}
                                                    value={medication.durationUnit}
                                                    onChange={(e) =>
                                                        handleUpdateMedicationField(
                                                            medication.id,
                                                            'durationUnit',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.medicationGrid}>
                                        <div className={styles.fieldGroup}>
                                            <SelectField
                                                label="Medication Priority"
                                                options={MEDICAL_PRIORITY}
                                                value={medication.priority}
                                                onChange={(e) =>
                                                    handleUpdateMedicationField(
                                                        medication.id,
                                                        'priority',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className={styles.fieldGroup}>
                                            <SelectField
                                                label="Administration Route"
                                                options={ADMINISTRATION_ROUTE}
                                                value={medication.route}
                                                onChange={(e) =>
                                                    handleUpdateMedicationField(medication.id, 'route', e.target.value)
                                                }
                                            />
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
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={styles.instructionsSection}>
                                        <label className={styles.instructionsLabel}>
                                            Instructions about Medication
                                        </label>
                                        <textarea
                                            className={styles.instructionsInput}
                                            placeholder="e.g. Take with food, finish the entire course"
                                            value={medication.instructions || ''}
                                            onChange={(e) =>
                                                handleUpdateMedicationField(
                                                    medication.id,
                                                    'instructions',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>

            <Modal
                isOpen={showVitalsModal}
                onClose={handleCloseVitalsModal}
                title="Create Vitals Check Request"
                size="md"
                footer={
                    <div className={styles.modalFooter}>
                        <button className={styles.cancelBtn} onClick={handleCloseVitalsModal} type="button">
                            Cancel
                        </button>
                        <button
                            className={styles.addPrescriptionBtn}
                            onClick={handleConfirmVitalsRequest}
                            disabled={selectedVitals.length === 0 || isSavingVitalPlan}
                            type="button"
                        >
                            {isSavingVitalPlan ? 'Saving...' : 'Confirm'}
                        </button>
                    </div>
                }
            >
                <div className={styles.vitalsModalContent}>
                    <p className={styles.vitalsSubtext}>{patientName} needs specific vital monitoring.</p>

                    <div className={styles.vitalsStep}>
                        <span className={styles.stepBadge}>1</span>
                        <span className={styles.stepTitle}>Select Vitals to Monitor</span>
                    </div>

                    <div className={styles.vitalsOptionsGrid}>
                        {vitalOptions.map((vital) => {
                            const isSelected = selectedVitals.includes(vital.id)
                            const isAlreadyActive = vitalPlan?.includes(vital.id)
                            return (
                                <button
                                    key={vital.id}
                                    type="button"
                                    className={`${styles.vitalOptionCard} ${isSelected ? styles.vitalOptionCardActive : ''}`}
                                    onClick={() => handleToggleVital(vital.id)}
                                    disabled={isAlreadyActive}
                                >
                                    <div className={styles.vitalOptionTop}>
                                        <span className={`${styles.vitalOptionIcon} ${vital.iconClassName}`}>
                                            {vital.icon}
                                        </span>
                                        {isAlreadyActive && <span className={styles.activeBadge}>Active</span>}
                                    </div>
                                    <span className={styles.vitalOptionLabel}>{vital.label}</span>
                                </button>
                            )
                        })}
                    </div>

                    {selectedVitals.length > 0 && (
                        <>
                            <div className={styles.vitalsStep}>
                                <span className={styles.stepBadge}>2</span>
                                <span className={styles.stepTitle}>Set Individual Monitoring Frequency</span>
                            </div>

                            <div className={styles.vitalsMonitorList}>
                                {vitalOptions
                                    .filter((vital) => selectedVitals.includes(vital.id))
                                    .map((vital) => (
                                        <div key={vital.id} className={styles.vitalMonitorCard}>
                                            <div className={styles.vitalMonitorHeader}>
                                                <span className={`${styles.vitalOptionIcon} ${vital.iconClassName}`}>
                                                    {vital.icon}
                                                </span>
                                                <span className={styles.vitalMonitorTitle}>{vital.label}</span>
                                            </div>

                                            <div className={styles.vitalMonitorFields}>
                                                <div className={styles.fieldGroup}>
                                                    <SelectField
                                                        label="Frequency"
                                                        options={frequencyOptions.map((f) => ({ label: f, value: f }))}
                                                        value={vitalsPreferences[vital.id].frequency}
                                                        onChange={(e) =>
                                                            handleUpdateVitalPreference(
                                                                vital.id,
                                                                'frequency',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div className={styles.fieldGroup}>
                                                    <SelectField
                                                        label="Duration"
                                                        options={durationOptions.map((d) => ({ label: d, value: d }))}
                                                        value={vitalsPreferences[vital.id].duration}
                                                        onChange={(e) =>
                                                            handleUpdateVitalPreference(
                                                                vital.id,
                                                                'duration',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                            <div className={styles.instructionsSection}>
                                <label className={styles.instructionsLabel}>
                                    Instructions for Nursing Staff (Optional)
                                </label>
                                <textarea
                                    className={styles.instructionsInput}
                                    placeholder="e.g., Please wake patient if asleep for BP check..."
                                    value={vitalsInstructions}
                                    onChange={(e) => setVitalsInstructions(e.target.value)}
                                />
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </>
    )
}
export default MedicationTable
