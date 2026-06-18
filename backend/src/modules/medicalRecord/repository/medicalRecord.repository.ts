import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IMedicalRecordRepository } from '../interfaces/medicalRecord.repository.interface'
import { MedicalRecordModel } from '../models/medicalRecord.model'
import { IClinicalNote, MedicalRecordDocument } from '../types/medicalRecord.types'

@injectable()
export class MedicalRecordRepository extends BaseRepository<MedicalRecordDocument> implements IMedicalRecordRepository {
    constructor() {
        super(MedicalRecordModel)
    }

    async findByPatientId(patientId: string): Promise<MedicalRecordDocument | null> {
        return this.model.findOne({ patientId }).lean()
    }

    async upsert(patientId: string, data: Partial<MedicalRecordDocument>): Promise<MedicalRecordDocument> {
        return this.model.findOneAndUpdate(
            { patientId },
            { $set: data },
            { upsert: true, returnDocument: 'after', new: true },
        )
    }

    async addClinicalNote(patientId: string, note: IClinicalNote): Promise<MedicalRecordDocument | null> {
        return this.model.findOneAndUpdate(
            { patientId },
            { $push: { clinicalNotes: note } },
            { upsert: true, returnDocument: 'after', new: true },
        )
    }
}
