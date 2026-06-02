import { Document, Types } from 'mongoose'

export type ReminderSourceType = 'medication' | 'vital' | 'custom'
export type CustomReminderStatus = 'pending' | 'completed'
export type ReminderStatus = CustomReminderStatus | 'missed'
export type ReminderPriority = 'low' | 'medium' | 'high'
export type ReminderItemPriority = ReminderPriority | 'critical'

export interface ReminderDocument extends Document {
    caregiverId: Types.ObjectId
    patientId?: Types.ObjectId
    title: string
    description: string
    scheduleTime: Date
    priority: ReminderPriority
    status: CustomReminderStatus
    createdAt: Date
    updatedAt: Date
}

export interface ReminderItem {
    _id: string
    source: ReminderSourceType
    title: string
    description?: string
    patientId?: string
    patientName?: string
    scheduleTime: Date
    priority: ReminderItemPriority
    status: ReminderStatus
}

export interface RemindersResponse {
    reminders: ReminderItem[]
    total: number
    pendingCount: number
    completedCount: number
}

export interface CreateReminderDTO {
    title: string
    description?: string
    patientId?: string
    scheduleTime: string
    priority?: ReminderPriority
}

export interface UpdateReminderDTO {
    title?: string
    description?: string
    patientId?: string
    scheduleTime?: string
    priority?: ReminderPriority
    status?: CustomReminderStatus
}
