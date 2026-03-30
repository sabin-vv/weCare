import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'

import { errorMiddleware } from './core/middleware/errorMiddleware'
import { createAdminRoutes } from './modules/admin/routes/admin.route'
import { createAuthRoutes } from './modules/auth/routes/auth.route'
import { createCaregiverRoutes } from './modules/caregiver/routes/caregiver.route'
import { createDoctorRoutes } from './modules/doctor/routes/doctor.route'
import { createPatientRoutes } from './modules/patient/routes/patient.route'
import { createUploadsRoutes } from './modules/uploads/routes/uploads.route'

const app = express()

app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    }),
)

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', createAuthRoutes())

app.use('/api/doctors', createDoctorRoutes())

app.use('/api/caregivers', createCaregiverRoutes())

app.use('/api/patients', createPatientRoutes())

app.use('/api/uploads', createUploadsRoutes())

app.use('/api/admin', createAdminRoutes())

app.use(errorMiddleware)

export default app
