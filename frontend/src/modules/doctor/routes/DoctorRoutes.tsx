import type { RouteObject } from 'react-router-dom'

import DoctorDashboard from '../pages/DoctorDashboard'

export const DoctorRoutes: RouteObject[] = [
    {
        path: '/doctor/dashboard',
        element: <DoctorDashboard />,
    },
]
