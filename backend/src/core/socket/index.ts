import { Server as HTTPServer } from 'http'
import { Server } from 'socket.io'

import { verifyAccessToken } from '../utils/jwt'

let io: Server

export const initializeSocketServer = (server: HTTPServer) => {
    io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            credentials: true,
        },
    })

    io.use((socket, next) => {
        const cookie = socket.handshake.headers.cookie

        if (!cookie) {
            return next(new Error('No cookie provided'))
        }

        const accessToken = cookie
            .split(';')
            .map((c) => c.trim())
            .find((c) => c.startsWith('accessToken='))
            ?.split('=')[1]

        if (!accessToken) {
            return next(new Error('No access token in cookie'))
        }

        try {
            const decoded = verifyAccessToken(accessToken)
            socket.data.userId = decoded.userId
            socket.data.role = decoded.role
            next()
        } catch {
            next(new Error('Invalid access token'))
        }
    })

    io.on('connection', (socket) => {
        const userId = socket.data.userId
        socket.join(`user:${userId}`)

        socket.on('disconnect', () => {
            socket.leave(`user:${userId}`)
        })
    })

    return io
}

export const getIO = (): Server => {
    if (!io) {
        throw new Error('Socket.io server not initialized')
    }
    return io
}
