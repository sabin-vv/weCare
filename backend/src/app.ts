import cors from 'cors'
import express from 'express'

import { errorMiddleware } from './core/middleware/errorMiddleware'
import { createAuthRoutes } from './modules/auth/routes/auth.route'
import { createDoctorRoutes } from './modules/doctor/routes/doctor.route'
import { createUploadsRoutes } from './modules/uploads/routes/uploads.route'

const app = express()

app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    }),
)

app.use(express.json())

app.use('/api/auth', createAuthRoutes())

app.use('/api/doctors', createDoctorRoutes())

app.use('/api/uploads', createUploadsRoutes())

app.use(errorMiddleware)

export default app
