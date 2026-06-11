import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { INotificationRepository } from '../interfaces/notification.repository.interface'
import { notificationModel } from '../models/notification.model'
import { NotificationDocument } from '../types/notification.types'

@injectable()
export class NotificationRepository extends BaseRepository<NotificationDocument> implements INotificationRepository {
    constructor() {
        super(notificationModel)
    }

    async findByRecipient(
        recipientId: string,
        options: { page: number; limit: number; unreadOnly: boolean },
    ): Promise<{ data: NotificationDocument[]; total: number; page: number; limit: number }> {
        const { page, limit, unreadOnly } = options
        const filter: Record<string, unknown> = { recipientId }

        if (unreadOnly) filter.isRead = false

        const [data, total] = await Promise.all([
            this.model
                .find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            this.model.countDocuments(filter),
        ])

        return { data, total, page, limit }
    }

    async markAsRead(id: string): Promise<NotificationDocument | null> {
        return this.model.findByIdAndUpdate(id, { isRead: true }, { returnDocument: 'after' })
    }

    async markAllAsRead(recipientId: string): Promise<void> {
        await this.model.updateMany({ recipientId, isRead: false }, { isRead: true })
    }

    async getUnreadCount(recipientId: string): Promise<number> {
        return this.model.countDocuments({ recipientId, isRead: false })
    }
}
