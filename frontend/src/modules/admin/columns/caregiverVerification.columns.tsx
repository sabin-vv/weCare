import type { PendingCaregiver } from '../interfaces/admin.interface'
import { getFileUrl } from '@/utils/getFileUrl'
import styles from '../pages/DoctorVerification.module.css'

export const pendingCaregiverColumns = [
    {
        header: 'Caregiver Name',
        key: 'name' as keyof PendingCaregiver,
        render: (caregiver: PendingCaregiver) => (
            <div className={styles.doctorInfo}>
                <div className={styles.avatar}>
                    {caregiver.profileImage ? (
                        <img src={getFileUrl(caregiver.profileImage)} alt={caregiver.name} />
                    ) : (
                        caregiver.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                    )}
                </div>
                <div className={styles.infoContent}>
                    <h4>{caregiver.name}</h4>
                    <p>{caregiver.email}</p>
                </div>
            </div>
        ),
    },
    {
        header: 'Certificate No',
        key: 'certificateNumber' as keyof PendingCaregiver,
        render: (caregiver: PendingCaregiver) => <span className={styles.license}>#{caregiver.certificateNumber}</span>,
    },
    {
        header: 'License No',
        key: 'licenseNumber' as keyof PendingCaregiver,
        render: (caregiver: PendingCaregiver) => <span className={styles.license}>#{caregiver.licenseNumber}</span>,
    },
    {
        header: 'Submission Date',
        key: 'createdAt' as keyof PendingCaregiver,
        render: (caregiver: PendingCaregiver) => (
            <div className={styles.date}>
                {new Date(caregiver.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                })}
                <span className={styles.time}>
                    {new Date(caregiver.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </span>
            </div>
        ),
    },
]

export const recentCaregiverColumns = [
    {
        header: 'Caregiver Name',
        key: 'name' as keyof PendingCaregiver,
        render: (caregiver: PendingCaregiver) => (
            <div className={styles.doctorInfo}>
                <div className={styles.avatar}>
                    {caregiver.profileImage ? (
                        <img src={getFileUrl(caregiver.profileImage)} alt={caregiver.name} />
                    ) : (
                        caregiver.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                    )}
                </div>
                <div className={styles.infoContent}>
                    <h4>{caregiver.name}</h4>
                    <p>{caregiver.email}</p>
                </div>
            </div>
        ),
    },
    {
        header: 'Status',
        key: 'verificationStatus' as keyof PendingCaregiver,
        render: (caregiver: PendingCaregiver) => (
            <span className={caregiver.verificationStatus === 'verified' ? styles.verifiedBadge : styles.rejectedBadge}>
                {caregiver.verificationStatus}
            </span>
        ),
    },
    {
        header: 'Verified/Rejected On',
        key: 'updatedAt' as keyof PendingCaregiver,
        render: (caregiver: PendingCaregiver) =>
            new Date(caregiver.updatedAt || caregiver.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            }),
    },
]
