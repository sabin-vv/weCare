import { model, Schema, Types } from 'mongoose'

import { NOTIFICATION_ROLES, NOTIFICATION_TYPES, NotificationDocument } from '../types/notification.types'

const notificationSchema = new Schema<NotificationDocument>(
    {
        recipientId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
        },
        recipientRole: {
            type: String,
            enum: NOTIFICATION_ROLES,
            required: true,
        },
        type: {
            type: String,
            enum: NOTIFICATION_TYPES,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
    },
    { timestamps: true },
)

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 })

export const notificationModel = model<NotificationDocument>('Notification', notificationSchema)
