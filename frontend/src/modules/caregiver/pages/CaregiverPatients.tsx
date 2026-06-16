import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getMyPatients, type PatientSummary } from '../api/caregiver.api'

import styles from './CaregiverPatients.module.css'

import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { env } from '@/config/env'
import { Section } from '@/shared/components/Section/Section'

const CaregiverPatients = () => {
    const [patients, setPatients] = useState<PatientSummary[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const baseUrl = env.AWS_BASE_URL

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const data = await getMyPatients()
                setPatients(data)
            } catch (err) {
                console.error('Error fetching patients:', err)
                toast.error(getErrorMessage(err))
            } finally {
                setIsLoading(false)
            }
        }
        fetchPatients()
    }, [])

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
            <Section>
                {patients.length === 0 ? (
                    <p className={styles.emptyText}>No patients assigned to you yet.</p>
                ) : (
                    <div className={styles.patientWrapper}>
                        {patients.map((patient) => (
                            <div key={patient._id} className={styles.patientCard}>
                                <div className={styles.cardLeft}>
                                    <div className={styles.avatar}>
                                        {patient.profileImage ? (
                                            <img src={`${baseUrl}${patient.profileImage}`} alt={patient.userName} />
                                        ) : (
                                            <span>{patient.userName.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>

                                    <div className={styles.patientInfo}>
                                        <div className={styles.nameRow}>
                                            <h3 className={styles.patientName}>{patient.userName}</h3>
                                            <span
                                                className={`${styles.riskBadge} ${styles[`risk${getRiskLabel(patient.riskLevel)}`]}`}
                                            >
                                                {getRiskLabel(patient.riskLevel)}
                                            </span>
                                        </div>

                                        <div className={styles.metaRow}>
                                            <span className={styles.metaItem}>
                                                {calculateAge(patient.dateOfBirth)} years
                                            </span>
                                            <span className={styles.metaDot}>•</span>
                                            <span className={styles.metaItem}>{patient.gender}</span>
                                            <span className={styles.metaDot}>•</span>
                                            <span className={styles.metaItem}>ID: #{patient.patientId}</span>
                                        </div>

                                        {patient.conditions.length > 0 && (
                                            <div className={styles.conditionRow}>
                                                <span className={styles.conditionLabel}>Conditions:</span>
                                                <span className={styles.conditionTags}>
                                                    {patient.conditions.map((condition) => (
                                                        <span key={condition} className={styles.conditionTag}>
                                                            {condition}
                                                        </span>
                                                    ))}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.cardRight}>
                                    <a
                                        href={`/caregiver/patients/${patient._id}/medication-monitor`}
                                        className={styles.viewBtn}
                                    >
                                        View Patient
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Section>
        </MainWrapper>
    )
}

export default CaregiverPatients
