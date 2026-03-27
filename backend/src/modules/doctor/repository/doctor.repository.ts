import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IDoctorRepository } from '../interfaces/doctor.repository.interface'
import { DoctorModel } from '../models/doctor.model'
import { DoctorDocument } from '../types/doctor.types'

@injectable()
export class DoctorRepository extends BaseRepository<DoctorDocument> implements IDoctorRepository {
    constructor() {
        super(DoctorModel)
    }
}
