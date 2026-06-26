import { createBrowserRouter, Outlet } from 'react-router-dom'

import { AdminRoutes } from './modules/admin/routes/AdminRoutes'
import { AuthRoutes } from './modules/auth/routes/auth.routes'
import { CaregiverRoutes } from './modules/caregiver/routes/CaregiverRoutes'
import { DoctorRoutes } from './modules/doctor/routes/DoctorRoutes'
import { PatientRoutes } from './modules/patient/routes/PatientRoutes'
import { PublicRoutes } from './modules/public/routes/PublicRoutes'
import PageNotFound from './shared/components/PageNotFound/PageNotFound'
import ScrollToTop from './shared/components/ScrollToTop/ScrollToTop'

const RootLayout = () => (
    <>
        <ScrollToTop />
        <Outlet />
    </>
)

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            ...PublicRoutes,
            ...AuthRoutes,
            ...AdminRoutes,
            ...DoctorRoutes,
            ...CaregiverRoutes,
            ...PatientRoutes,
            {
                path: '*',
                element: <PageNotFound />,
            },
        ],
    },
])
