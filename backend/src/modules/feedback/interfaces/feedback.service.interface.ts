import { CreateFeedbackDTO, FeedbackResponse } from '../types/feedback.types'

export interface IFeedbackService {
    submitFeedback(userId: string, dto: CreateFeedbackDTO): Promise<FeedbackResponse>
}
