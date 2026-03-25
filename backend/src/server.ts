import app from './app'
import { logger } from './core/logger/logger'

const PORT = 5000

app.listen(PORT, () => {
    logger.info(`Server running at port ${PORT}`)
})
