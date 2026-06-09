import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'

import styles from './FeedbackModal.module.css'

import Modal from '@/shared/components/Modal/Modal'

interface FeedbackModalProps {
    isOpen: boolean
    onClose: () => void
    targetName: string
    targetRole: 'doctor' | 'caregiver'
    initialRating?: number
    initialComment?: string
    onSubmit: (rating: number, comment?: string) => Promise<void>
}

const FeedbackModal = ({ isOpen, onClose, targetName, targetRole, initialRating, initialComment, onSubmit }: FeedbackModalProps) => {
    const [rating, setRating] = useState(initialRating || 0)
    const [hovered, setHovered] = useState(0)
    const [comment, setComment] = useState(initialComment || '')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setRating(initialRating || 0)
            setComment(initialComment || '')
        }
    }, [isOpen, initialRating, initialComment])

    const handleSubmit = async () => {
        if (rating === 0) return
        setIsSubmitting(true)
        try {
            await onSubmit(rating, comment || undefined)
            onClose()
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        onClose()
    }

    const hasExistingRating = !!initialRating

    const footer = (
        <div className={styles.footerActions}>
            <button className={styles.cancelBtn} onClick={handleClose} disabled={isSubmitting}>
                Cancel
            </button>
            <button className={styles.submitBtn} onClick={handleSubmit} disabled={rating === 0 || isSubmitting}>
                {isSubmitting ? 'Submitting...' : hasExistingRating ? 'Update Feedback' : 'Submit Feedback'}
            </button>
        </div>
    )

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={hasExistingRating ? `Update rating for ${targetName}` : `Rate ${targetName}`} footer={footer} size="sm">
            <div className={styles.body}>
                <p className={styles.subtitle}>
                    How was your experience with {targetRole === 'doctor' ? 'Dr.' : ''} {targetName}?
                </p>

                <div className={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className={`${styles.starBtn} ${(hovered || rating) >= star ? styles.starActive : ''}`}
                            onMouseEnter={() => setHovered(star)}
                            onMouseLeave={() => setHovered(0)}
                            onClick={() => setRating(star)}
                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                            <Star size={28} fill={(hovered || rating) >= star ? '#f5a623' : 'none'} />
                        </button>
                    ))}
                </div>

                {(rating > 0 || hasExistingRating) && (
                    <textarea
                        className={styles.textarea}
                        placeholder="Share your experience (optional)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={500}
                        rows={3}
                    />
                )}
            </div>
        </Modal>
    )
}

export default FeedbackModal
