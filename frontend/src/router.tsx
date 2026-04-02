import { createBrowserRouter } from 'react-router-dom'

import { AdminRoutes } from './modules/admin/routes/AdminRoutes'
import { AuthRoutes } from './modules/auth/routes/auth.routes'
import { CaregiverRoutes } from './modules/caregiver/routes/CaregiverRoutes'
import { DoctorRoutes } from './modules/doctor/routes/DoctorRoutes'
import { PatientRoutes } from './modules/patient/routes/PatientRoutes'

export const router = createBrowserRouter([
    ...AuthRoutes,
    ...AdminRoutes,
    ...DoctorRoutes,
    ...CaregiverRoutes,
    ...PatientRoutes,
])
