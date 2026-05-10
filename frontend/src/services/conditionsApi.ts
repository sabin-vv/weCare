import axios from 'axios'

import { env } from '@/config/env'

export interface ConditionResult {
    name: string
    code: string
}

type ConditionsApiResponse = [number, string[], unknown?, string[][]?]

export const searchConditions = async (query: string): Promise<ConditionResult[]> => {
    const normalizedQuery = query.trim()
    const apiUrl = env.CONDITIONS_API_URL

    if (!normalizedQuery || !apiUrl) {
        return []
    }

    try {
        const response = await axios.get<ConditionsApiResponse>(apiUrl, {
            params: { terms: normalizedQuery },
        })

        const [, codes, , extras] = response.data
        if (!Array.isArray(codes) || !Array.isArray(extras)) {
            return []
        }

        return codes
            .map((code, index) => {
                const row = extras[index]
                const name = Array.isArray(row) ? row[0] : undefined

                if (!code || !name) {
                    return null
                }

                return { code, name }
            })
            .filter((condition): condition is ConditionResult => condition !== null)
    } catch {
        return []
    }
}
