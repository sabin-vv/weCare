import { FeedbackDocument, FeedbackTargetRole } from '../types/feedback.types'

export interface IFeedbackRepository {
    create(data: Partial<FeedbackDocument>): Promise<FeedbackDocument>
    findOneByPatientAndTarget(patientId: string, targetId: string, targetRole: FeedbackTargetRole): Promise<FeedbackDocument | null>
    findFeedbackByPatient(patientId: string): Promise<FeedbackDocument[]>
    update(id: string, data: Partial<FeedbackDocument>): Promise<FeedbackDocument | null>
    getAverageRatingByDoctors(): Promise<Array<{ doctorId: string; averageRating: number; reviewCount: number }>>
    getAverageRatingByDoctor(doctorId: string): Promise<{ averageRating: number; reviewCount: number } | null>
}
