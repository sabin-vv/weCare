import type { AssistantChatRequest, AssistantChatResponse } from '../types/assistant.types'

export interface IAssistantService {
    chat(data: AssistantChatRequest): Promise<AssistantChatResponse>
}
