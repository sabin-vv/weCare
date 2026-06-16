import { Types } from 'mongoose'

import { AppointmentDocument } from '../../appointment/types/appointment.types'
import { UserDocument } from '../../auth/types/auth.types'
import { PrescriptionDocument } from '../../prescription/types/prescription.types'
import { VitalScheduleDocument } from '../../vital/types/vital.types'
import {
    ListPatientMapper,
    PatientDetailsDTO,
    PatientDocument,
    PatientEntity,
    PatientPrescriptionDTO,
    PatientProfileResponseDTO,
    PatientResponseDTO,
    PatientVitalDTO,
} from '../types/patient.types'
import { RegisterPatientDTO } from '../validator/patient.schema'

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
        patientMongoId: patient._id.toString(),
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        isActive: user.isActive,
        patientId: patient.patientId,
        dateOfBirth: patient.dateOfBirth.toISOString(),
        gender: patient.gender,
        conditions: patient.conditions ?? [],
        profileImage: patient.profileImage,
        caregiverId: patient.caregiverId?.toString(),
    }
}

export const toListPatientsMapper = (
    user: UserDocument,
    patient: PatientDocument,
    _appointment: AppointmentDocument | null,
    caregiver: UserDocument | null,
): ListPatientMapper => {
    return {
        _id: patient._id.toString(),
        patientId: patient.patientId,
        name: user.name,
        profileImage: patient.profileImage,
        conditions: patient.conditions || [],
        riskLevel: patient.riskLevel,
        caregiver: caregiver?.name || 'Unassigned',
        clinicalStatus: patient.clinicalStatus || 'active',
    }
}

export const toPatientDetailsDTO = (
    user: UserDocument,
    patient: PatientDocument,
    appointment: AppointmentDocument | null,
    caregiver: UserDocument | null,
    vitals: VitalScheduleDocument[],
    prescriptions: PrescriptionDocument[],
): PatientDetailsDTO => {
    const appointmentStatusForDetails =
        appointment && ['confirmed', 'in_consultation', 'completed'].includes(appointment.status)
            ? appointment.status
            : 'confirmed'
    const status = appointment?.status || patient.clinicalStatus || patient.accountStatus || 'active'

    const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
    const mappedVitals: PatientVitalDTO[] = vitals.map((vital) => ({
        _id: vital._id.toString(),
        type: vital.vitalType,
        value: vital.recordedValue?.value,
        systolic: vital.recordedValue?.systolic,
        diastolic: vital.recordedValue?.diastolic,
        unit: vital.recordedValue?.unit ?? '',
        recordedAt:
            vital.recordedAt?.toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            }) ?? '',
        recordedBy: vital.recordedBy?.toString(),
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
        caregiver: caregiver?.name,
        status,
        clinicalStatus: patient.clinicalStatus || 'active',
        appointmentStatus: appointmentStatusForDetails,
        vitals: mappedVitals,
        prescriptions: mappedPrescriptions,
    }
}
