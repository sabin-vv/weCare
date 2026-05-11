import { env } from '@/config/env'

const MEDICINE_API_BASE = env.MEDICINE_API_URL || 'https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search'

export interface MedicineSearchResult {
    name: string
    strengths: string[]
}

type MedicineApiResponse = [
    number,
    string[],
    {
        STRENGTHS_AND_FORMS?: string[][]
    },
    string[][]?,
]

export const searchMedicines = async (searchTerm: string): Promise<MedicineSearchResult[]> => {
    if (!searchTerm.trim()) {
        return []
    }

    try {
        const params = new URLSearchParams({
            ef: 'STRENGTHS_AND_FORMS',
            terms: searchTerm,
            maxList: '500',
        })

        const response = await fetch(`${MEDICINE_API_BASE}?${params.toString()}`)

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`)
        }

        const data: MedicineApiResponse = await response.json()

        const names = data[1] || []
        const strengthsList = data[2]?.STRENGTHS_AND_FORMS || []

        const results: MedicineSearchResult[] = names.map((name, index) => ({
            name,
            strengths: strengthsList[index] || [],
        }))

        return results
    } catch (error) {
        console.error('Error searching medicines:', error)
        return []
    }
}

export const getMedicineNames = async (searchTerm: string): Promise<string[]> => {
    const results = await searchMedicines(searchTerm)
    return results.map((r) => r.name)
}

export const getMedicineStrengths = async (medicineName: string): Promise<string[]> => {
    const results = await searchMedicines(medicineName)

    const match = results.find((r) => r.name === medicineName) || results[0]
    return match ? match.strengths : []
}
