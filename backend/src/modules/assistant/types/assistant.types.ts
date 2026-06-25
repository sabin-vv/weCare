import { UserRole } from '../../auth/types/auth.types'

export interface AssistantChatRequest {
    userId: string
    role: UserRole.PATIENT
    message: string
}

export interface AssistantChatResponse {
    text: string
}
