import { Types } from 'mongoose'

import { AppointmentDocument } from '../../appointment/types/appointment.types'
import { UserDocument } from '../../auth/types/auth.types'
import { PrescriptionDocument } from '../../prescription/types/prescription.types'
import { VitalDocument } from '../../vital/types/vital.types'
import {
    ListPatientMapper,
    PatientDetailsDTO,
    PatientDocument,
    PatientEntity,
    PatientPrescriptionDTO,
    PatientProfileResponseDTO,
    PatientVitalDTO,
} from '../types/patient.types'
import { RegisterPatientDTO } from '../validator/patient.schema'

export interface PatientResponseDTO {
    id: string
    userId: string
    patientId: string
    dateOfBirth: string
    gender: string
    profileImage?: string
    isActive: boolean
}

export const toPatientEntity = (userId: Types.ObjectId, patientId: string, dto: RegisterPatientDTO): PatientEntity => {
    return {
        userId,
        patientId,
        dateOfBirth: new Date(dto.dateOfBirth),
        gender: dto.gender,
    }
}

export const toPatientResponseDTO = (user: UserDocument, patient: PatientDocument): PatientResponseDTO => {
    return {
        id: patient._id.toString(),
        userId: patient.userId.toString(),
        patientId: patient.patientId,
        dateOfBirth: patient.dateOfBirth.toISOString(),
        gender: patient.gender,
        profileImage: patient.profileImage,
        isActive: user.isActive,
    }
}

export const toPatientProfileResponseDTO = (
    user: UserDocument,
    patient: PatientDocument,
): PatientProfileResponseDTO => {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        patientId: patient.patientId,
        dateOfBirth: patient.dateOfBirth.toISOString(),
        gender: patient.gender,
        conditions: patient.conditions ?? [],
        profileImage: patient.profileImage,
        isActive: user.isActive,
    }
}

const mapAppointmentStatus = (status?: string): 'confirmed' | 'in_consultation' | 'completed' => {
    if (!status) return 'confirmed'
    if (['confirmed', 'in_consultation', 'completed'].includes(status)) {
        return status as 'confirmed' | 'in_consultation' | 'completed'
    }
    return 'confirmed'
}

export const toListPatientsMapper = (
    user: UserDocument,
    patient: PatientDocument,
    appointment: AppointmentDocument | null,
    caregiver: UserDocument | null,
): ListPatientMapper => {
    const accountStatus = patient.accountStatus || 'active'
    const appointmentStatus = mapAppointmentStatus(appointment?.status)
    const status = appointmentStatus

    return {
        _id: patient._id.toString(),
        patientId: patient.patientId,
        name: user.name,
        profileImage: patient.profileImage,
        conditions: patient.conditions || [],
        riskLevel: patient.riskLevel,
        caregiver: caregiver?.name || 'Unassigned',
        accountStatus,
        appointmentStatus,
        status,
    }
}

export const toPatientDetailsDTO = (
    user: UserDocument,
    patient: PatientDocument,
    appointment: AppointmentDocument | null,
    caregiver: UserDocument | null,
    vitals: VitalDocument[],
    prescriptions: PrescriptionDocument[],
): PatientDetailsDTO => {
    const appointmentStatusForDetails = appointment ? mapAppointmentStatus(appointment.status) : 'confirmed'
    const status = appointment?.status || patient.clinicalStatus || patient.accountStatus || 'active'

    const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
    const mappedVitals: PatientVitalDTO[] = vitals.map((vital) => ({
        _id: vital._id.toString(),
        type: vital.type,
        value: vital.value,
        systolic: vital.systolic,
        diastolic: vital.diastolic,
        unit: vital.unit,
        recordedAt: vital.recordedAt.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }),
        recordedBy: vital.recordedBy.toString(),
    }))
    const mappedPrescriptions: PatientPrescriptionDTO[] = prescriptions.map((prescription) => ({
        _id: prescription._id.toString(),
        patientId: prescription.patientId.toString(),
        prescribedBy: prescription.prescribedBy.toString(),
        medications: prescription.medications.map((medication) => ({
            name: medication.name,
            dosage: medication.dosage,
            route: medication.route,
            frequency: medication.frequency,
            scheduleTimes: medication.scheduleTimes,
            priority: medication.priority || 'Medium',
            instructions: medication.instructions,
            duration: medication.duration,
            durationUnit: medication.durationUnit,
            endDate: medication.endDate?.toISOString(),
        })),
        note: prescription.note,
        status: prescription.status,
        discontinuedAt: prescription.discontinuedAt?.toISOString(),
        discontinuedBy: prescription.discontinuedBy?.toString(),
        prescribedAt: prescription.prescribedAt.toISOString(),
        endDate: prescription.endDate?.toISOString(),
        updatedAt: prescription.updatedAt.toISOString(),
    }))

    return {
        _id: patient._id.toString(),
        patientId: patient.patientId,
        name: user.name,
        age,
        gender: patient.gender,
        profileImage: patient.profileImage,
        conditions: patient.conditions || [],
        riskLevel: patient.riskLevel,
        caregiver: caregiver?.name || 'Unassigned',
        status,
        clinicalStatus: patient.clinicalStatus || 'active',
        appointmentStatus: appointmentStatusForDetails,
        vitals: mappedVitals,
        prescriptions: mappedPrescriptions,
    }
}
