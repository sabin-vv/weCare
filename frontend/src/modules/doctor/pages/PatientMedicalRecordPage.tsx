import { Activity, Heart, Droplets, Thermometer } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

import { addClinicalNote, getPatientMedicalRecord, updateMedicalRecord } from '../api/doctor.api'
import type { ClinicalNote, MedicalRecordData } from '../types/doctor.types'

import styles from './PatientMedicalRecordPage.module.css'

import { env } from '@/config/env'
import DoctorLayout from '@/layout/DoctorLayout'
import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import { Section } from '@/shared/components/Section/Section'
import { getErrorMessage } from '@/utils/getErrorMessage'

const PatientMedicalRecordPage = () => {
    const { patientId } = useParams<{ patientId: string }>()
    const navigate = useNavigate()
    const [record, setRecord] = useState<MedicalRecordData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [allergiesInput, setAllergiesInput] = useState('')
    const [pastSurgeries, setPastSurgeries] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [newNote, setNewNote] = useState('')
    const [isAddingNote, setIsAddingNote] = useState(false)

    const fetchRecord = useCallback(async () => {
        if (!patientId) return
        setIsLoading(true)
        try {
            const data = await getPatientMedicalRecord(patientId)
            setRecord(data)
            setPastSurgeries(data.pastSurgeries)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }, [patientId])

    useEffect(() => {
        fetchRecord()
    }, [fetchRecord])

    const addAllergy = () => {
        const trimmed = allergiesInput.trim()
        if (!trimmed || !record) return
        if (record.allergies.includes(trimmed)) {
            toast.error('Allergy already added')
            return
        }
        setRecord({ ...record, allergies: [...record.allergies, trimmed] })
        setAllergiesInput('')
    }

    const removeAllergy = (index: number) => {
        if (!record) return
        setRecord({
            ...record,
            allergies: record.allergies.filter((_, i) => i !== index),
        })
    }

    const handleSave = async () => {
        if (!patientId) return
        setIsSaving(true)
        try {
            const updated = await updateMedicalRecord(patientId, {
                allergies: record?.allergies,
                pastSurgeries,
            })
            setRecord(updated)
            toast.success('Medical record updated')
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsSaving(false)
        }
    }

    const handleAddNote = async () => {
        if (!patientId || !newNote.trim()) return
        setIsAddingNote(true)
        try {
            const updated = await addClinicalNote(patientId, newNote.trim())
            setRecord(updated)
            setNewNote('')
            toast.success('Note added')
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsAddingNote(false)
        }
    }

    const vitalIcons: Record<string, ReactNode> = {
        blood_pressure: <Activity size={18} />,
        heart_rate: <Heart size={18} />,
        spo2: <Droplets size={18} />,
        blood_sugar: <Thermometer size={18} />,
    }

    const vitalNameFormat = (vital: string): string => {
        if (vital === 'blood_pressure') return 'Blood Pressure'
        if (vital === 'heart_rate') return 'Heart Rate'
        if (vital === 'spo2') return 'SPO2'
        if (vital === 'blood_sugar') return 'Blood Sugar'
        return vital
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'active':
                return styles.prescriptionStatusActive
            case 'on_hold':
                return styles.prescriptionStatusOnHold
            case 'discontinued':
                return styles.prescriptionStatusDiscontinued
            case 'completed':
                return styles.prescriptionStatusCompleted
            default:
                return ''
        }
    }

    const getClinicalStatusClass = (status: string) => {
        switch (status) {
            case 'active':
                return styles.statusActive
            case 'hospitalized':
                return styles.statusHospitalized
            case 'recovered':
                return styles.statusRecovered
            case 'deceased':
                return styles.statusDeceased
            default:
                return ''
        }
    }

    if (isLoading) {
        return (
            <DoctorLayout>
                <MainWrapper>
                    <div className="loading">Loading medical record...</div>
                </MainWrapper>
            </DoctorLayout>
        )
    }

    if (!record) {
        return (
            <DoctorLayout>
                <MainWrapper>
                    <div className="error">Medical record not found</div>
                </MainWrapper>
            </DoctorLayout>
        )
    }

    return (
        <DoctorLayout>
            <MainWrapper>
                <div className={styles.page}>
                    <button className={styles.backBtn} onClick={() => navigate(`/doctor/patients/${patientId}`)}>
                        ← Back to Patient
                    </button>

                    <div className={styles.header}>
                        <div className={styles.headerImage}>
                            {record.profileImage ? (
                                <img src={`${env.AWS_BASE_URL}${record.profileImage}`} alt="patient" />
                            ) : (
                                record.patientName?.[0]?.toUpperCase()
                            )}
                        </div>
                        <div className={styles.headerInfo}>
                            <h1 className={styles.headerName}>{record.patientName}</h1>
                            <div className={styles.headerMeta}>
                                <span>{record.age} years old</span>
                                <span>•</span>
                                <span>{record.gender.charAt(0).toUpperCase() + record.gender.slice(1)}</span>
                                <span>•</span>
                                <span>ID: #{record.patientId}</span>
                                <span>•</span>
                                <span
                                    className={`${styles.statusBadge} ${getClinicalStatusClass(record.clinicalStatus)}`}
                                >
                                    {record.clinicalStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Section title="Medical History">
                        <div className={styles.editableSection}>
                            <div>
                                <strong>Conditions</strong>
                                {record.conditions.length > 0 ? (
                                    <div className={styles.conditionsList}>
                                        {record.conditions.map((condition, i) => (
                                            <span key={i} className={styles.conditionChip}>
                                                {condition}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={styles.emptyText}>No conditions recorded</p>
                                )}
                            </div>

                            <div>
                                <strong>Allergies</strong>
                                <div className={styles.tagInputWrapper}>
                                    {record.allergies.map((allergy, i) => (
                                        <span key={i} className={styles.tag}>
                                            {allergy}
                                            <button className={styles.tagRemove} onClick={() => removeAllergy(i)}>
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        className={styles.tagInput}
                                        placeholder="Add allergy..."
                                        value={allergiesInput}
                                        onChange={(e) => setAllergiesInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                addAllergy()
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <strong>Past Surgeries</strong>
                                <textarea
                                    className={styles.textareaField}
                                    value={pastSurgeries}
                                    onChange={(e) => setPastSurgeries(e.target.value)}
                                    placeholder="No past surgeries recorded"
                                />
                            </div>

                            <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </Section>

                    <Section title="Vital Signs">
                        {record.vitals.length > 0 ? (
                            <div className={styles.vitalsGrid}>
                                {record.vitals.map((vital) => (
                                    <div key={vital._id} className={styles.vitalCard}>
                                        <div className={styles.vitalHeader}>
                                            <span className={styles.vitalIcon}>
                                                {vitalIcons[vital.type] || <Activity size={18} />}
                                            </span>
                                            <span className={styles.vitalName}>{vitalNameFormat(vital.type)}</span>
                                        </div>
                                        <div>
                                            <span className={styles.vitalValue}>
                                                {vital.type === 'blood_pressure'
                                                    ? `${vital.systolic}/${vital.diastolic}`
                                                    : vital.value}
                                            </span>
                                            <span className={styles.vitalUnit}>{vital.unit}</span>
                                        </div>
                                        <div className={styles.vitalTime}>
                                            Recorded: {formatDateTime(vital.recordedAt)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.emptyText}>No vital signs recorded</p>
                        )}
                    </Section>

                    <Section title="Current Medications">
                        {record.prescriptions.filter((p) => p.status === 'active').length > 0 ? (
                            <table className={styles.prescriptionTable}>
                                <thead>
                                    <tr>
                                        <th>Medication</th>
                                        <th>Dosage</th>
                                        <th>Frequency</th>
                                        <th>Route</th>
                                        <th>Status</th>
                                        <th>Prescribed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {record.prescriptions
                                        .filter((p) => p.status === 'active')
                                        .flatMap((p) =>
                                            p.medications.map((med, i) => (
                                                <tr key={`${p._id}-${i}`}>
                                                    <td>{med.name}</td>
                                                    <td>{med.dosage}</td>
                                                    <td>{med.frequency}</td>
                                                    <td>{med.route}</td>
                                                    <td>
                                                        <span
                                                            className={`${styles.prescriptionStatus} ${getStatusClass(med.status)}`}
                                                        >
                                                            {med.status.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td>{formatDate(p.prescribedAt)}</td>
                                                </tr>
                                            )),
                                        )}
                                </tbody>
                            </table>
                        ) : (
                            <p className={styles.emptyText}>No active medications</p>
                        )}
                    </Section>

                    <Section title="Clinical Notes">
                        <div className={styles.notesList}>
                            {record.clinicalNotes.length > 0 ? (
                                [...record.clinicalNotes]
                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                    .map((note: ClinicalNote, i) => (
                                        <div key={note._id || i} className={styles.noteCard}>
                                            <div className={styles.noteHeader}>
                                                <span className={styles.noteDoctor}>{note.doctorName}</span>
                                                <span className={styles.noteTime}>
                                                    {formatDateTime(note.createdAt)}
                                                </span>
                                            </div>
                                            <div className={styles.noteText}>{note.note}</div>
                                        </div>
                                    ))
                            ) : (
                                <p className={styles.emptyText}>No clinical notes</p>
                            )}
                        </div>
                        <div className={styles.addNoteRow}>
                            <textarea
                                className={styles.addNoteInput}
                                placeholder="Add a clinical note..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                            />
                            <button
                                className={styles.addNoteBtn}
                                onClick={handleAddNote}
                                disabled={!newNote.trim() || isAddingNote}
                            >
                                {isAddingNote ? 'Adding...' : 'Add Note'}
                            </button>
                        </div>
                    </Section>
                </div>
            </MainWrapper>
        </DoctorLayout>
    )
}

export default PatientMedicalRecordPage
