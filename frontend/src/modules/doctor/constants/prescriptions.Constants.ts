import type { Options } from '@/shared/components/SelectField/SelectField.types'

export const FREQUENCY: Options[] = [
    { label: 'Once daily', value: 'Once daily' },
    { label: 'Twice daily', value: 'Twice daily' },
    { label: 'Three times daily', value: 'Three times daily' },
    { label: 'Four times daily', value: 'Four times daily' },
] as const
export const DURATION: Options[] = [
    { label: 'Days', value: 'Days' },
    { label: 'Weeks', value: 'Weeks' },
    { label: 'Months', value: 'Months' },
] as const

export const MEDICAL_PRIORITY: Options[] = [
    { label: 'Critical', value: 'Critical' },
    { label: 'High', value: 'High' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Low', value: 'Low' },
] as const

export const ADMINISTRATION_ROUTE: Options[] = [
    { label: 'Oral', value: 'Oral' },
    { label: 'Intravenous (IV)', value: 'Intravenous' },
    { label: 'Injection', value: 'Intramuscular' },
    { label: 'Inhalation', value: 'Inhalation' },
]
