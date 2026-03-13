import app from './app'
import database from './config/db'
import env from './config/env'

const startServer = async () => {
    try {
        database()

        const PORT = env.port

        app.listen(PORT, () => console.log(`server started at port ${PORT}`))
    } catch (error) {
        console.error('Failed to start Server', error)
        process.exit(1)
    }
}
startServer()
