import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IReminderRepository } from '../interfaces/reminder.repository.interface'
import { ReminderModel } from '../models/reminder.model'
import { ReminderDocument } from '../types/reminder.types'

@injectable()
export class ReminderRepository extends BaseRepository<ReminderDocument> implements IReminderRepository {
    constructor() {
        super(ReminderModel)
    }

    async findByCaregiverId(caregiverId: string): Promise<ReminderDocument[]> {
        return this.model
            .find({ caregiverId: new Types.ObjectId(caregiverId) })
            .sort({ scheduleTime: 1, createdAt: -1 })
    }
}
