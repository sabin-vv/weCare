import type { RouteObject } from 'react-router-dom'
import CaregiverDashboard from '../pages/CaregiverDashboard'

export const CaregiverRoutes: RouteObject[] = [
    {
        path: '/caregiver/dashboard',
        element: <CaregiverDashboard />,
    },
]
