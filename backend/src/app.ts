import cors from 'cors'
import express, { urlencoded } from 'express'

import { errorHandler } from './middlewares/error.middleware'
import { authRouter } from './modules/auth'
import { caregiverRouter } from './modules/caregiver'
import { doctorRouter } from './modules/doctor'
import { patientRouter } from './modules/patient'

const app = express()

app.use(cors())
app.use(express.json())
app.use(urlencoded({ extended: true }))

app.use('/api/auth', authRouter)
app.use('/api/doctors', doctorRouter)
app.use('/api/caregivers', caregiverRouter)
app.use('/api/patients', patientRouter)

app.use(errorHandler)

export default app
