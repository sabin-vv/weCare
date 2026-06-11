import 'reflect-metadata'
import './container'

import http from 'http'

import app from './app'
import { connectDB } from './core/config/db'
import { env } from './core/config/env'
import { initializeCrons } from './core/cron'
import { logger } from './core/logger/logger'
import { initializeSocketServer } from './core/socket'

const PORT = env.PORT

const startServer = async () => {
    await connectDB()
    initializeCrons()

    const server = http.createServer(app)
    initializeSocketServer(server)

    server.listen(PORT, () => {
        logger.info(`Server running at port ${PORT}`)
    })
}
startServer()
