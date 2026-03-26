import 'reflect-metadata'

import app from './app'
import { env } from './core/config/env'
import { logger } from './core/logger/logger'

const PORT = env.PORT

app.listen(PORT, () => {
    logger.info(`Server running at port ${PORT}`)
})
