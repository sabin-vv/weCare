import { env } from '../../../core/config/env'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { MSG } from '../constants/messages'
import { IAssistantService } from '../interfaces/assistant.service.interface'
import { SYSTEM_PROMPT } from '../prompts/system.prompt'
import type { AssistantChatRequest, AssistantChatResponse } from '../types/assistant.types'

const GEMINI_MODEL = env.GEMINI_MODEL
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

export class AssistantService implements IAssistantService {
    async chat({ message }: AssistantChatRequest): Promise<AssistantChatResponse> {
        if (!env.GEMINI_API_KEY) {
            throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, MSG.GEMINI_API_KEY_NOT_CONFIGURED)
        }

        const payload = {
            contents: [{ role: 'user', parts: [{ text: message }] }],
            systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }],
            },
            generationConfig: {
                maxOutputTokens: 512,
                temperature: 0.7,
            },
        }

        const url = `${GEMINI_API_URL}?key=${env.GEMINI_API_KEY}`

        const controller = new AbortController()

        const timeout = setTimeout(() => {
            controller.abort()
        }, 10000)

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        })

        clearTimeout(timeout)

        if (!response.ok) {
            const errorText = await response.text()
            this._handleGeminiError(response.status, errorText)
        }

        const data = await response.json()
        const content = data?.candidates?.[0]?.content?.parts?.[0]?.text

        if (!content || typeof content !== 'string') {
            throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, MSG.INVALID_GEMINI_RESPONSE)
        }

        return { text: content.trim() }
    }

    private _handleGeminiError(status: number, message?: string): never {
        switch (status) {
            case 400:
                throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.INVALID_AI_REQUEST)
            case 401:
                throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.INVALID_AI_API_KEY)
            case 403:
                throw new AppError(HTTP_STATUS.FORBIDDEN, MSG.ACCESS_DENIED)
            case 404:
                throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.AI_MODEL_NOT_FOUND)
            case 429:
                throw new AppError(HTTP_STATUS.TOO_MANY_REQUESTS, MSG.TOO_MANY_REQUESTS)

            case 500:
            case 502:
            case 503:
                throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, MSG.AI_SERVER_UNAVAILABLE)
            default:
                throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message ?? MSG.UNEXPECTED_AI_ERROR)
        }
    }
}
