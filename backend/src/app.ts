import express, { urlencoded } from 'express'
import cors from 'cors'
import { createAuthRoute } from './modules/auth/routes/authRoute'
import { createDoctorRouter } from './modules/doctor/routes/doctorRoute'

import { errorHandler } from './middlewares/error.middleware'

const app = express()

app.use(cors())
app.use(express.json())
app.use(urlencoded({ extended: true }))

app.use('/api/auth', createAuthRoute)
app.use('/api/doctors', createDoctorRouter)

app.use(errorHandler)

export default app
