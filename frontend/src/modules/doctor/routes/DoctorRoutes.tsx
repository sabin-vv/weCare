import type { RouteObject } from 'react-router-dom'

import DoctorSettings from '../form/DoctorSettings'
import DoctorDashboard from '../pages/DoctorDashboard'

export const DoctorRoutes: RouteObject[] = [
    {
        path: '/doctor/dashboard',
        element: <DoctorDashboard />,
    },
    {
        path: '/doctor/settings',
        element: <DoctorSettings />,
    },
]
