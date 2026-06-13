import { useCallback, useEffect, useRef, useState } from 'react'

import type {
    NewNotificationEvent,
    Notification,
    NotificationsResponse,
    UnreadCountResponse,
} from '../types/hooks.types'

import { api } from '@/services/api'
import { NOTIFICATIONS_API } from '@/shared/constants/api.constants'
import { useAuth } from '@/shared/context/AuthContext'
import { useSocket } from '@/shared/context/SocketContext'

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const { isAuthenticated } = useAuth()
    const { socket } = useSocket()
    const fetchedRef = useRef(false)
    const notificationsRef = useRef<Notification[]>([])

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await api.get<NotificationsResponse>(NOTIFICATIONS_API, {
                params: { limit: 20 },
            })
            notificationsRef.current = res.data.data
            setNotifications(res.data.data)
        } catch (error) {
            console.error('Failed to fetch notifications', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await api.get<UnreadCountResponse>(`${NOTIFICATIONS_API}/unread-count`)
            setUnreadCount(res.data.data.count)
        } catch (error) {
            console.error('Failed to fetch unread count', error)
        }
    }, [])

    const markAsRead = useCallback(
        async (id: string) => {
            const shouldDecrement = notificationsRef.current.some((n) => n._id === id && !n.isRead)
            const nextNotifications = notificationsRef.current.map((n) => (n._id === id ? { ...n, isRead: true } : n))

            notificationsRef.current = nextNotifications
            setNotifications(nextNotifications)
            if (shouldDecrement) {
                setUnreadCount((prev) => Math.max(0, prev - 1))
            }

            try {
                await api.patch(`${NOTIFICATIONS_API}/${id}/read`)
            } catch {
                fetchNotifications()
                fetchUnreadCount()
            }
        },
        [fetchNotifications, fetchUnreadCount],
    )

    const markAllAsRead = useCallback(async () => {
        const nextNotifications = notificationsRef.current.map((n) => ({ ...n, isRead: true }))

        notificationsRef.current = nextNotifications
        setNotifications(nextNotifications)
        setUnreadCount(0)

        try {
            await api.patch(`${NOTIFICATIONS_API}/read-all`)
        } catch (error) {
            console.error('Failed to mark all notifications as read', error)
            fetchNotifications()
            fetchUnreadCount()
        }
    }, [fetchNotifications, fetchUnreadCount])

    useEffect(() => {
        if (!isAuthenticated) {
            notificationsRef.current = []
            setNotifications([])
            setUnreadCount(0)
            fetchedRef.current = false
            return
        }
        if (fetchedRef.current) return
        fetchedRef.current = true
        fetchNotifications()
        fetchUnreadCount()
    }, [isAuthenticated, fetchNotifications, fetchUnreadCount])

    useEffect(() => {
        if (!socket) return

        const handleNewNotification = (event: NewNotificationEvent) => {
            const notificationId = event._id ?? event.id

            if (!notificationId) {
                fetchNotifications()
                fetchUnreadCount()
                return
            }

            const notification: Notification = {
                _id: String(notificationId),
                title: event.title,
                message: event.message,
                type: event.type,
                createdAt: event.createdAt,
                isRead: event.isRead ?? false,
            }

            if (notificationsRef.current.some((item) => item._id === notification._id)) return

            const nextNotifications = [notification, ...notificationsRef.current].slice(0, 20)
            notificationsRef.current = nextNotifications
            setNotifications(nextNotifications)

            if (!notification.isRead) {
                setUnreadCount((prev) => prev + 1)
            }
        }

        socket.on('new_notification', handleNewNotification)

        return () => {
            socket.off('new_notification', handleNewNotification)
        }
    }, [socket, fetchNotifications, fetchUnreadCount])

    return {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications,
    }
}
