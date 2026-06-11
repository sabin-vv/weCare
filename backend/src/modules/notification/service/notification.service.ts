import { Types } from "mongoose"
import { inject, injectable } from "tsyringe"

import { TOKENS } from "../../../container/tokens"
import { HTTP_STATUS } from "../../../core/constants/httpStatus"
import { AppError } from "../../../core/errors/AppError"
import { getIO } from "../../../core/socket"
import { SOCKET_EVENTS } from "../../../core/socket/events"
import { INotificationRepository } from "../interfaces/notification.repository.interface"
import { INotificationService } from "../interfaces/notification.service.interface"
import {
  CreateNotificationPayload,
  NotificationDocument,
  NotificationQuery,
} from "../types/notification.types"

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject(TOKENS.INotificationRepository)
    private _notificationRepo: INotificationRepository,
  ) {}

  async createNotification(
    payload: CreateNotificationPayload,
  ): Promise<NotificationDocument> {
    const notification = await this._notificationRepo.create({
      recipientId: new Types.ObjectId(payload.recipientId),
      recipientRole: payload.recipientRole,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      metadata: payload.metadata,
    })

    try {
      getIO()
        .to(`user:${payload.recipientId}`)
        .emit(SOCKET_EVENTS.NEW_NOTIFICATION, {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          createdAt: notification.createdAt,
        })
    } catch (err) {
      console.error("Notification socket emit failed", err)
    }

    return notification
  }

  async getNotifications(
    userId: string,
    role: string,
    query: NotificationQuery,
  ): Promise<{
    data: NotificationDocument[]
    total: number
    page: number
    limit: number
  }> {
    const page = query.page || 1
    const limit = query.limit || 20
    const unreadOnly = query.unreadOnly || false

    return this._notificationRepo.findByRecipient(userId, {
      page,
      limit,
      unreadOnly,
    })
  }

  async markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<NotificationDocument | null> {
    const notification = await this._notificationRepo.findById(notificationId)
    if (!notification) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Notification not found")
    }
    if (notification.recipientId.toString() !== userId) {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        "Not authorized to mark this notification as read",
      )
    }

    return this._notificationRepo.markAsRead(notificationId)
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this._notificationRepo.markAllAsRead(userId)
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this._notificationRepo.getUnreadCount(userId)
  }

  async deleteNotification(
    userId: string,
    notificationId: string,
  ): Promise<NotificationDocument | null> {
    const notification = await this._notificationRepo.findById(notificationId)
    if (!notification) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Notification not found")
    }
    if (notification.recipientId.toString() !== userId) {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        "Not authorized to delete this notification",
      )
    }

    return this._notificationRepo.delete(notificationId)
  }
}
