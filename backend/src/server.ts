import 'reflect-metadata'
import './container'

import app from './app'
import { connectDB } from './core/config/db'
import { env } from './core/config/env'
import { logger } from './core/logger/logger'

const PORT = env.PORT

const startServer = async () => {
    await connectDB()

    app.listen(PORT, () => {
        logger.info(`Server running at port ${PORT}`)
    })
}
startServer()
