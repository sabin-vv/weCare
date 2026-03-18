import Patient from '../modules/patient/models/patient'

export async function generatePatientId(): Promise<string> {
    const year = new Date().getFullYear()

    const lastPatient = await Patient.findOne({
        patientId: new RegExp(`^PAT-${year}`),
    })
        .sort({ createdAt: -1 })
        .select('patientId')

    if (!lastPatient || !lastPatient.patientId) {
        return `PAT-${year}00001`
    }

    const lastNumber = parseInt(lastPatient.patientId.slice(-5))

    const nextNumber = lastNumber + 1

    return `PAT-${year}${String(nextNumber).padStart(5, '0')}`
}
