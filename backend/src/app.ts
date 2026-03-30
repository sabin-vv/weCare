import cors from 'cors'
import express from 'express'

import { errorMiddleware } from './core/middleware/errorMiddleware'
import { createAuthRoutes } from './modules/auth/routes/auth.route'

const app = express()

app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    }),
)

app.use(express.json())

app.use('/api/auth', createAuthRoutes())

app.use(errorMiddleware)

export default app
