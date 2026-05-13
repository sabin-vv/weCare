import { PrescriptionDocument, PrescriptionStatus } from '../types/prescription.types'

export interface IPrescriptionRepository {
    create(data: Partial<PrescriptionDocument>): Promise<PrescriptionDocument>
    findById(id: string): Promise<PrescriptionDocument | null>
    findByPatientId(patientId: string): Promise<PrescriptionDocument[]>
    updateStatus(
        id: string,
        data: Partial<Pick<PrescriptionDocument, 'status' | 'discontinuedAt' | 'discontinuedBy' | 'endDate'>>,
    ): Promise<PrescriptionDocument | null>
    findByPatientIdAndStatus(patientId: string, status: PrescriptionStatus): Promise<PrescriptionDocument[]>
}
