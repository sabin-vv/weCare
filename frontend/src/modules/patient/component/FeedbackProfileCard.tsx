import { CircleCheck, CircleX, Mail, Phone, Star } from 'lucide-react'

import type { FeedbackProfileCardProps } from '../types/patient.types'

import styles from './FeedbackProfileCard.module.css'

import { env } from '@/config/env'
import { Role } from '@/modules/auth/types/auth.types'

const FeedbackProfileCard = ({ profile, onFeedback }: FeedbackProfileCardProps) => {
    const baseUrl = env.AWS_BASE_URL
    return (
        <div className={styles.card}>
            <div className={styles.content}>
                <img
                    src={`${baseUrl}${profile.profileImage}` || '/user.png'}
                    alt={profile.name}
                    className={styles.avatar}
                />

                <div className={`${styles.statusBadge} ${profile.status ? styles.active : styles.inactive}`}>
                    {profile.status ? <CircleCheck size={18} /> : <CircleX size={18} />}
                    {profile.status ? 'Active' : 'Inactive'}
                </div>
                <span className={styles.label}>
                    {profile.role.toLowerCase().includes('doctor') ? 'PRIMARY DOCTOR' : 'PRIMARY CAREGIVER'}
                </span>

                <h3 className={styles.name}>
                    {profile.role === Role.DOCTOR ? 'Dr.' : ''}
                    {profile.name}
                </h3>
                {(profile.email || profile.mobile) && (
                    <div className={styles.contactInfo}>
                        {profile.email && (
                            <span className={styles.contactItem}>
                                <Mail size={14} />
                                {profile.email}
                            </span>
                        )}
                        {profile.mobile && (
                            <span className={styles.contactItem}>
                                <Phone size={14} />
                                {profile.mobile}
                            </span>
                        )}
                    </div>
                )}
                {profile.specialization && <span className={styles.role}>{profile.specialization.join(',')}</span>}

                {profile.rating && (
                    <div className={styles.stars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={16}
                                fill={star <= profile.rating! ? '#f5a623' : 'none'}
                                color={star <= profile.rating! ? '#f5a623' : '#d4dce8'}
                            />
                        ))}
                    </div>
                )}
            </div>

            <button className={styles.feedbackButton} onClick={onFeedback}>
                {profile.rating ? 'Update Feedback' : 'Provide Your Feedback'}
            </button>
        </div>
    )
}

export default FeedbackProfileCard
