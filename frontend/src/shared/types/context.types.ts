import type { Socket } from 'socket.io-client'

export interface SocketContextValue {
    socket: Socket | null
}
