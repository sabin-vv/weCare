import { CreateNotificationPayload, NotificationDocument, NotificationQuery } from '../types/notification.types'

export interface INotificationService {
    createNotification(payload: CreateNotificationPayload): Promise<NotificationDocument>
    getNotifications(
        userId: string,
        role: string,
        query: NotificationQuery,
    ): Promise<{ data: NotificationDocument[]; total: number; page: number; limit: number }>
    markAsRead(userId: string, notificationId: string): Promise<NotificationDocument | null>
    markAllAsRead(userId: string): Promise<void>
    getUnreadCount(userId: string): Promise<number>
    deleteNotification(userId: string, notificationId: string): Promise<NotificationDocument | null>
}
