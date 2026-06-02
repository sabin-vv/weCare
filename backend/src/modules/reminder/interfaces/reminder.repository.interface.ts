import { ReminderDocument } from '../types/reminder.types'

export interface IReminderRepository {
    create(data: Partial<ReminderDocument>): Promise<ReminderDocument>
    findById(id: string): Promise<ReminderDocument | null>
    findByCaregiverId(caregiverId: string): Promise<ReminderDocument[]>
    update(id: string, data: Partial<ReminderDocument>): Promise<ReminderDocument | null>
    delete(id: string): Promise<ReminderDocument | null>
}
