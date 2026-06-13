import { Bell } from 'lucide-react'

import styles from './NotificationDropdown.module.css'
import type { NotificationDropdownProps } from './NotificationDropdown.types'

const NotificationDropdown = ({
    notifications,
    unreadCount,
    onMarkAsRead,
    onMarkAllAsRead,
}: NotificationDropdownProps) => {
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString()
    }

    const getNotificationIcon = (type: string) => {
        if (type.includes('appointment')) return 'calendar'
        if (type.includes('payment')) return 'payment'
        if (type.includes('medication')) return 'medication'
        if (type.includes('vital') || type.includes('symptom')) return 'alert'
        return 'default'
    }

    return (
        <div className={styles.dropdown}>
            <div className={styles.header}>
                <span className={styles.title}>Notifications</span>
                {unreadCount > 0 && (
                    <button className={styles.markAllBtn} onClick={onMarkAllAsRead}>
                        Mark all read
                    </button>
                )}
            </div>

            <div className={styles.list}>
                {notifications.length === 0 ? (
                    <div className={styles.empty}>
                        <Bell className={styles.emptyIcon} size={32} />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div
                            key={notif._id}
                            className={`${styles.item} ${!notif.isRead ? styles.unread : ''}`}
                            onClick={() => !notif.isRead && onMarkAsRead(notif._id)}
                        >
                            <span className={`${styles.icon} ${styles[getNotificationIcon(notif.type)]}`}>
                                <Bell size={18} />
                            </span>
                            <div className={styles.content}>
                                <span className={styles.notificationTitle}>{notif.title}</span>
                                <span className={styles.message}>{notif.message}</span>
                                <span className={styles.time}>{formatTime(notif.createdAt)}</span>
                            </div>
                            {!notif.isRead && <span className={styles.dot} />}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default NotificationDropdown
