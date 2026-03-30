import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IPatientRepository } from '../interfaces/patient.repository.interface'
import { PatientModel } from '../models/patient.model'
import { PatientDocument } from '../types/patient.types'

@injectable()
export class PatientRepository extends BaseRepository<PatientDocument> implements IPatientRepository {
    constructor() {
        super(PatientModel)
    }

    async findByUserId(userId: Types.ObjectId): Promise<PatientDocument | null> {
        return this.model.findOne({ userId })
    }
}

