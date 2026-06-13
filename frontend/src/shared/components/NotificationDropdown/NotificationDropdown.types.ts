import type { Notification } from '@/shared/types/hooks.types'

export interface NotificationDropdownProps {
    notifications: Notification[]
    unreadCount: number
    onMarkAsRead: (id: string) => void
    onMarkAllAsRead: () => void
}
