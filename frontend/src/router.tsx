import { AuthRoutes } from './modules/auth/routes/auth.routes'
import { AdminRoutes } from './modules/admin/routes/AdminRoutes'
import { DoctorRoutes } from './modules/doctor/routes/DoctorRoutes'
import { CaregiverRoutes } from './modules/caregiver/routes/CaregiverRoutes'
import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
    ...AuthRoutes,
    ...AdminRoutes,
    ...DoctorRoutes,
    ...CaregiverRoutes,
])
