import { CreateReminderDTO, ReminderDocument, RemindersResponse, UpdateReminderDTO } from '../types/reminder.types'

export interface IReminderService {
    getReminders(caregiverUserId: string): Promise<RemindersResponse>
    createReminder(caregiverUserId: string, dto: CreateReminderDTO): Promise<ReminderDocument>
    updateReminder(reminderId: string, dto: UpdateReminderDTO): Promise<ReminderDocument>
    deleteReminder(reminderId: string): Promise<void>
    markReminderDone(reminderId: string): Promise<ReminderDocument>
}
