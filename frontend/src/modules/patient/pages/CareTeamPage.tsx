import { Activity } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getCareTeam, createFeedback } from '../api/patient.api'
import FeedbackModal from '../component/FeedbackModal/FeedbackModal'
import FeedbackProfileCard from '../component/FeedbackProfileCard'

import styles from './CareTeamPage.module.css'

import PatientLayout from '@/layout/PatientLayout'
import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import { getErrorMessage } from '@/utils/getErrorMessage'

interface TeamMember {
    id: string
    name: string
    role: string
    profileImage?: string
    specialization?: string[]
    status: boolean
    rating?: number
    email?: string
    mobile?: string
}

interface FeedbackTarget {
    id: string
    name: string
    role: 'doctor' | 'caregiver'
    initialRating?: number
    initialComment?: string
}

const CareTeamPage = () => {
    const [doctor, setDoctor] = useState<TeamMember | null>(null)
    const [caregiver, setCaregiver] = useState<TeamMember | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [feedbackTarget, setFeedbackTarget] = useState<FeedbackTarget | null>(null)

    useEffect(() => {
        const fetchCareTeam = async () => {
            try {
                const members = await getCareTeam()
                const doctorMember = members.find((m) => m.role === 'doctor') || null
                const caregiverMember = members.find((m) => m.role === 'caregiver') || null

                if (doctorMember) {
                    setDoctor({
                        id: doctorMember.id,
                        name: doctorMember.name.replace('Dr. ', ''),
                        role: 'doctor',
                        profileImage: doctorMember.profileImage,
                        specialization: doctorMember.specialization,
                        status: doctorMember.isActive,
                        rating: doctorMember.myRating,
                        email: doctorMember.email,
                        mobile: doctorMember.mobile,
                    })
                }
                if (caregiverMember) {
                    setCaregiver({
                        id: caregiverMember.id,
                        name: caregiverMember.name,
                        role: 'caregiver',
                        profileImage: caregiverMember.profileImage,
                        status: caregiverMember.isActive,
                        rating: caregiverMember.myRating,
                        email: caregiverMember.email,
                        mobile: caregiverMember.mobile,
                    })
                }
            } catch (err) {
                toast.error(getErrorMessage(err))
            } finally {
                setIsLoading(false)
            }
        }

        fetchCareTeam()
    }, [])

    const handleFeedback = async (rating: number, comment?: string) => {
        if (!feedbackTarget) return
        await createFeedback({
            targetId: feedbackTarget.id,
            targetRole: feedbackTarget.role,
            rating,
            comment,
        })

        if (feedbackTarget.role === 'doctor') {
            setDoctor((prev) => (prev ? { ...prev, rating } : prev))
        } else {
            setCaregiver((prev) => (prev ? { ...prev, rating } : prev))
        }

        toast.success('Feedback submitted successfully')
    }

    if (isLoading) {
        return (
            <PatientLayout>
                <MainWrapper title="Care Team" subtitle="Your Primary healthcare support team">
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner} />
                    </div>
                </MainWrapper>
            </PatientLayout>
        )
    }

    const hasNoMembers = !doctor && !caregiver

    return (
        <PatientLayout>
            <MainWrapper title="Care Team" subtitle="Your Primary healthcare support team">
                {hasNoMembers ? (
                    <div className={styles.emptyState}>
                        <Activity size={42} />
                        <p>No care team members assigned yet.</p>
                    </div>
                ) : (
                    <div className={styles.cardWrap}>
                        {doctor && (
                            <FeedbackProfileCard
                                profile={doctor}
                                onFeedback={() =>
                                    setFeedbackTarget({
                                        id: doctor.id,
                                        name: doctor.name,
                                        role: 'doctor',
                                        initialRating: doctor.rating,
                                        initialComment: undefined,
                                    })
                                }
                            />
                        )}
                        {caregiver && (
                            <FeedbackProfileCard
                                profile={caregiver}
                                onFeedback={() =>
                                    setFeedbackTarget({
                                        id: caregiver.id,
                                        name: caregiver.name,
                                        role: 'caregiver',
                                        initialRating: caregiver.rating,
                                        initialComment: undefined,
                                    })
                                }
                            />
                        )}
                    </div>
                )}
            </MainWrapper>

            {feedbackTarget && (
                <FeedbackModal
                    isOpen={!!feedbackTarget}
                    onClose={() => setFeedbackTarget(null)}
                    targetName={feedbackTarget.name}
                    targetRole={feedbackTarget.role}
                    initialRating={feedbackTarget.initialRating}
                    initialComment={feedbackTarget.initialComment}
                    onSubmit={handleFeedback}
                />
            )}
        </PatientLayout>
    )
}

export default CareTeamPage
