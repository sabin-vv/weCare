import type { RouteObject } from 'react-router-dom'

import AvailabilityPage from '../pages/AvailabilityPage'
import DoctorDashboard from '../pages/DoctorDashboard'
import DoctorSettings from '../pages/DoctorSettings'

export const DoctorRoutes: RouteObject[] = [
    {
        path: '/doctor/dashboard',
        element: <DoctorDashboard />,
    },
    {
        path: '/doctor/settings',
        element: <DoctorSettings />,
    },
    {
        path: '/doctor/availability',
        element: <AvailabilityPage />,
    },
]
