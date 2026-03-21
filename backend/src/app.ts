import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { urlencoded } from 'express'

import { errorHandler } from './middlewares/error.middleware'
import { authRouter } from './modules/auth'
import { caregiverRouter } from './modules/caregiver'
import { doctorRouter } from './modules/doctor'
import { patientRouter } from './modules/patient'

const app = express()

app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true, 
    }),
)
app.use(express.json())
app.use(urlencoded({ extended: true }))
app.use(cookieParser()) 

app.use('/api/auth', authRouter)
app.use('/api/doctors', doctorRouter)
app.use('/api/caregivers', caregiverRouter)
app.use('/api/patients', patientRouter)

app.use(errorHandler)

export default app
