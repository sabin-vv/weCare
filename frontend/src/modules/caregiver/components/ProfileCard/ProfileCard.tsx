import type { PatientSummary } from '../../types/caregiver.types'

import styles from './ProfileCard.module.css'

import { env } from '@/config/env'

interface ProfileCardProps {
    patient: PatientSummary
    action?: {
        label: string
        onClick?: () => void
    }
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

const ProfileCard = ({ patient, action }: ProfileCardProps) => {
    const baseUrl = env.AWS_BASE_URL
    return (
        <div className={styles.card}>
            <div className={styles.cardLeft}>
                <div className={styles.avatar}>
                    {patient.profileImage ? (
                        <img src={`${baseUrl}${patient.profileImage}`} alt={patient.userName} />
                    ) : (
                        <span>{patient.userName.charAt(0).toUpperCase()}</span>
                    )}
                </div>

                <div className={styles.info}>
                    <div className={styles.nameRow}>
                        <h3 className={styles.name}>{patient.userName}</h3>
                        <span className={`${styles.riskBadge} ${styles[`risk${getRiskLabel(patient.riskLevel)}`]}`}>
                            {getRiskLabel(patient.riskLevel)}
                        </span>
                    </div>

                    <div className={styles.metaRow}>
                        <span>{calculateAge(patient.dateOfBirth)} years</span>
                        <span className={styles.metaDot}>•</span>
                        <span>{patient.gender}</span>
                        <span className={styles.metaDot}>•</span>
                        <span>ID: #{patient.patientId}</span>
                    </div>

                    {patient.conditions.length > 0 && (
                        <div className={styles.conditionRow}>
                            <span className={styles.conditionLabel}>Conditions:</span>
                            <div className={styles.conditionTags}>
                                {patient.conditions.map((c) => (
                                    <span key={c} className={styles.conditionTag}>
                                        {c}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {action && (
                <div className={styles.cardRight}>
                    <button type="button" className={styles.actionBtn} onClick={action.onClick}>
                        {action.label}
                    </button>
                </div>
            )}
        </div>
    )
}

export default ProfileCard
