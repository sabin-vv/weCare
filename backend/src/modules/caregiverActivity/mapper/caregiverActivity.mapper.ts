import { Types } from 'mongoose'

import {
    CaregiverActivityLogDocument,
    CaregiverActivityLogResponse,
} from '../types/caregiverActivity.types'

type PopulatedPatient = {
    _id: Types.ObjectId
    userId: { name: string } | Types.ObjectId
}

const toId = (value: Types.ObjectId | string): string => {
    return value instanceof Types.ObjectId ? value.toString() : String(value)
}

export const toCaregiverActivityLogResponseDTO = (
    doc: CaregiverActivityLogDocument,
): CaregiverActivityLogResponse => {
    const patient = doc.patientId as Types.ObjectId | PopulatedPatient
    const isPopulated = !(patient instanceof Types.ObjectId)
    const userId = isPopulated ? patient.userId : null

    return {
        id: doc._id.toString(),
        caregiverId: toId(doc.caregiverId),
        patientId: isPopulated ? patient._id.toString() : patient.toString(),
        patientName:
            userId && typeof userId === 'object' && 'name' in userId && typeof userId.name === 'string'
                ? userId.name
                : '',
        activityType: doc.activityType,
        referenceId: doc.referenceId ? toId(doc.referenceId) : undefined,
        description: doc.description,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
    }
}
