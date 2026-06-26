import { UpdateWriteOpResult } from 'mongoose'

import { PrescriptionDocument, PrescriptionStatus } from '../types/prescription.types'

export interface IPrescriptionRepository {
    create(data: Partial<PrescriptionDocument>): Promise<PrescriptionDocument>
    findById(id: string): Promise<PrescriptionDocument | null>
    findByPatientId(patientId: string): Promise<PrescriptionDocument[]>
    findByPatientIdWithPagination(
        patientId: string,
        page: number,
        limit: number,
        status?: string,
    ): Promise<{ data: PrescriptionDocument[]; total: number }>
    updateStatus(
        id: string,
        data: Partial<Pick<PrescriptionDocument, 'status' | 'discontinuedAt' | 'discontinuedBy' | 'endDate'>>,
    ): Promise<PrescriptionDocument | null>
    findByPatientIdAndStatus(patientId: string, status: PrescriptionStatus): Promise<PrescriptionDocument[]>

    pausePrescription(patientId: string): Promise<UpdateWriteOpResult>

    completePrescription(patientId: string): Promise<UpdateWriteOpResult>

    discontinuePrescriptionByPatientId(patientId: string, discontinuedBy: string): Promise<number>

    resumePrescription(patientId: string): Promise<UpdateWriteOpResult>
}
