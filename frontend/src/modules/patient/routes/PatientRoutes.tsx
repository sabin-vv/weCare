import type { RouteObject } from 'react-router-dom'
import PatientDashboard from '../pages/PatientDashboard'

export const PatientRoutes: RouteObject[] = [
    {
        path: '/patient/dashboard',
        element: <PatientDashboard />,
    },
]
