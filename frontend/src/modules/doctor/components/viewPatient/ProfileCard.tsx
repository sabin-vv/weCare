import type { ProfileCardProps } from '../../types/doctor.types'

import styles from './ProfileCard.module.css'

import { env } from '@/config/env'

const ProfileCard = ({
    name,
    riskLevel,
    age,
    gender,
    patinetId,
    conditions,
    profileImage,
    appointmentStatus,
    onStartConsultation,
    onCompleteConsultation,
    onAddCondition,
}: ProfileCardProps) => {
    const baseUrl = env.AWS_BASE_URL

    return (
        <div className={styles.card}>
            <div className={styles.leftSection}>
                <div className={styles.imageWrapper}>
                    {profileImage ? (
                        <img src={`${baseUrl}${profileImage}`} alt="patient" className={styles.image} />
                    ) : (
                        name && name[0]?.toUpperCase()
                    )}
                </div>

                <div className={styles.infoSection}>
                    <div className={styles.topRow}>
                        <h2 className={styles.name}>{name}</h2>

                        {riskLevel && <span className={styles.riskBadge}>{riskLevel}</span>}
                    </div>

                    <div className={styles.metaInfo}>
                        <span>{age} years old</span>
                        <span>•</span>
                        <span>{gender.charAt(0).toUpperCase() + gender.slice(1)} </span>
                        <span>•</span>
                        <span>ID: #{patinetId} </span>
                    </div>

                    <div className={styles.conditionRow}>
                        <span className={styles.conditionLabel}>Condition:</span>

                        <div className={styles.condition}>
                            {conditions && conditions.length > 0 ? (
                                conditions.join(',')
                            ) : (
                                <button
                                    className={
                                        appointmentStatus === 'confirmed'
                                            ? styles.disabledAddButton
                                            : styles.addCondition
                                    }
                                    onClick={onAddCondition}
                                >
                                    Add
                                </button>
                            )}
                        </div>

                        {conditions && conditions.length > 0 && (
                            <button className={styles.editBtn} onClick={onAddCondition}>
                                ✎
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {appointmentStatus === 'confirmed' ? (
                <button className={styles.startBtn} onClick={onStartConsultation}>
                    Start Consultation
                </button>
            ) : appointmentStatus === 'in_consultation' ? (
                <div className={styles.consulatationStatus}>
                    <span>In Consultation</span>
                    <button className={styles.inConsultationBtn} onClick={onCompleteConsultation}>
                        Complete Consultation
                    </button>
                </div>
            ) : (
                <div className={styles.rightSection}>
                    <button className={styles.caregiverBtn}>Assign Caregiver ▼</button>

                    <div className={styles.actions}>
                        <button className={styles.hospitalBtn}>Admit to Hospital</button>

                        <select className={styles.statusSelect}>
                            <option>Active</option>
                            <option>Recovered</option>
                            <option>Hospitalized</option>
                            <option>Deceased</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProfileCard
