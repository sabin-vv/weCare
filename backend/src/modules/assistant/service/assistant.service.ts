import { env } from '../../../core/config/env'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IAssistantService } from '../interfaces/assistant.service.interface'
import { SYSTEM_PROMPT } from '../prompts/system.prompt'
import type { AssistantChatRequest, AssistantChatResponse } from '../types/assistant.types'

const GEMINI_MODEL = env.GEMINI_MODEL
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

export class AssistantService implements IAssistantService {
    async chat({ message }: AssistantChatRequest): Promise<AssistantChatResponse> {
        if (!env.GEMINI_API_KEY) {
            throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gemini API key is not configured')
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
            throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Invalid response from Gemini')
        }

        return { text: content.trim() }
    }

    private _handleGeminiError(status: number, message?: string): never {
        switch (status) {
            case 400:
                throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Invalid AI request')
            case 401:
                throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Invalid AI API key')
            case 403:
                throw new AppError(HTTP_STATUS.FORBIDDEN, 'Access denied')
            case 404:
                throw new AppError(HTTP_STATUS.NOT_FOUND, 'AI model not found')
            case 429:
                throw new AppError(HTTP_STATUS.TOO_MANY_REQUESTS, 'Too many AI requests.Please try again later')

            case 500:
            case 502:
            case 503:
                throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'AI seerver temporarily unavilable')
            default:
                throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message ?? 'Unexpected AI service error')
        }
    }
}
