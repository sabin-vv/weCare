import { FeedbackDocument } from '../types/feedback.types'

export interface IFeedbackRepository {
    create(data: Partial<FeedbackDocument>): Promise<FeedbackDocument>
    findOneByPatientAndTarget(patientId: string, targetId: string, targetRole: string): Promise<FeedbackDocument | null>
    findFeedbackByPatient(patientId: string): Promise<FeedbackDocument[]>
    update(id: string, data: Partial<FeedbackDocument>): Promise<FeedbackDocument | null>
}
