export interface Notification {
    _id: string
    title: string
    message: string
    isRead: boolean
    createdAt: string
    type: string
}

export interface NotificationsResponse {
    success: boolean
    data: Notification[]
    total: number
    page: number
    limit: number
}

export interface UnreadCountResponse {
    success: boolean
    data: { count: number }
}

export type NewNotificationEvent = Omit<Notification, '_id' | 'isRead'> & {
    _id?: string
    id?: string
    isRead?: boolean
}
