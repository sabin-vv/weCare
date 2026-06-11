import { NotificationDocument } from '../types/notification.types'

export interface INotificationRepository {
    create(data: Partial<NotificationDocument>): Promise<NotificationDocument>
    findById(id: string): Promise<NotificationDocument | null>
    findByRecipient(
        recipientId: string,
        options: { page: number; limit: number; unreadOnly: boolean },
    ): Promise<{ data: NotificationDocument[]; total: number; page: number; limit: number }>
    markAsRead(id: string): Promise<NotificationDocument | null>
    markAllAsRead(recipientId: string): Promise<void>
    getUnreadCount(recipientId: string): Promise<number>
    delete(id: string): Promise<NotificationDocument | null>
}
