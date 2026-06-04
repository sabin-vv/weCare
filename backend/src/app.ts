import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'

import { errorMiddleware } from './core/middleware/errorMiddleware'
import { createAdminRoutes } from './modules/admin/routes/admin.route'
import { createAlertRoutes } from './modules/alert/routes/alert.route'
import { createAppointmentRoutes } from './modules/appointment/routes/appointment.route'
import { createAuthRoutes } from './modules/auth/routes/auth.route'
import { createCaregiverRoutes } from './modules/caregiver/routes/caregiver.route'
import { createDoctorRoutes } from './modules/doctor/routes/doctor.route'
import { createMedicationRoutes } from './modules/medication/routes/medication.route'
import { createMedicationLogRoutes } from './modules/medication/routes/medicationLog.route'
import { createPatientRoutes } from './modules/patient/routes/patient.route'
import { createPaymentRoutes } from './modules/payment/routes/payment.routes'
import { createPrescriptionRoutes } from './modules/prescription/routes/prescription.route'
import { createReminderRoutes } from './modules/reminder/routes/reminder.route'
import { createSubscriptionRoutes } from './modules/subscription/routes/subscription.route'
import { createSymptomLogRoutes } from './modules/symptom/routes/symptomLog.route'
import { createUploadsRoutes } from './modules/uploads/routes/uploads.route'
import { createVitalRoutes } from './modules/vital/routes/vital.route'
import { createWalletRoutes } from './modules/wallet/routes/wallet.route'

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

app.use('/api/appointments', createAppointmentRoutes())

app.use('/api/payments', createPaymentRoutes())

app.use('/api/prescriptions', createPrescriptionRoutes())

app.use('/api/medications', createMedicationRoutes())

app.use('/api/medication-logs', createMedicationLogRoutes())

app.use('/api/subscriptions', createSubscriptionRoutes())

app.use('/api/vitals', createVitalRoutes())

app.use('/api/symptom-logs', createSymptomLogRoutes())

app.use('/api/wallet', createWalletRoutes())

app.use('/api/reminders', createReminderRoutes())

app.use('/api/alerts', createAlertRoutes())

app.use('/api/uploads', createUploadsRoutes())

app.use('/api/admin', createAdminRoutes())

app.use(errorMiddleware)

export default app
