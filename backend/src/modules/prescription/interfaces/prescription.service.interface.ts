import { PrescriptionDocument } from '../types/prescription.types'
import { CreatePrescriptionDTO, UpdatePrescriptionStatusDTO } from '../validator/prescription.schema'

export interface PaginationInfo {
    page: number
    limit: number
    total: number
    totalPages: number
}

export interface PaginatedPrescriptions {
    data: PrescriptionDocument[]
    pagination: PaginationInfo
}

export interface IPrescriptionService {
    createPrescription(doctorUserId: string, dto: CreatePrescriptionDTO): Promise<PrescriptionDocument>
    getPatientPrescriptions(
        patientId: string,
        page?: number,
        limit?: number,
        status?: string,
    ): Promise<PaginatedPrescriptions | PrescriptionDocument[]>
    updatePrescriptionStatus(
        doctorUserId: string,
        prescriptionId: string,
        dto: UpdatePrescriptionStatusDTO,
    ): Promise<PrescriptionDocument>
}
