import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../../core/base/base.repository'
import { DoctorModel } from '../../../../models/doctor.model'
import { DoctorDocument } from '../../types/doctor.types'
import { IDoctorRepository } from '../interface/doctor.repository.interface'

@injectable()
export class DoctorRepository extends BaseRepository<DoctorDocument> implements IDoctorRepository {
    constructor() {
        super(DoctorModel)
    }
}
