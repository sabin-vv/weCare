import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { io, type Socket } from 'socket.io-client'

import type { SocketContextValue } from '../types/context.types'

import { useAuth } from './AuthContext'

import { env } from '@/config/env'

const SocketContext = createContext<SocketContextValue | null>(null)

const getSocketUrl = () => {
    try {
        return new URL(env.API_URL).origin
    } catch {
        return 'http://localhost:5000'
    }
}

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { user, isAuthenticated } = useAuth()
    const socketRef = useRef<Socket | null>(null)
    const [socket, setSocket] = useState<Socket | null>(null)

    useEffect(() => {
        if (!isAuthenticated || !user) {
            if (socketRef.current) {
                socketRef.current.disconnect()
                socketRef.current = null
            }
            setSocket(null)
            return
        }

        const socketUrl = getSocketUrl()

        const newSocket = io(socketUrl, {
            withCredentials: true,
        })

        newSocket.on('connect_error', (error: unknown) => {
            console.error('Socket connection failed', error)
        })

        socketRef.current = newSocket
        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
            socketRef.current = null
            setSocket(null)
        }
    }, [isAuthenticated, user])

    const value = useMemo(() => ({ socket }), [socket])

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export const useSocket = (): SocketContextValue => {
    const ctx = useContext(SocketContext)
    if (!ctx) throw new Error('useSocket must be used inside <SocketProvider>')
    return ctx
}
