import type { RouteObject } from 'react-router-dom'
import CaregiverRegisterPage from '../pages/CaregiverRegisterPage'
import DoctorRegisterPage from '../pages/DoctorRegisterPage'

export const AuthRoutes: RouteObject[] = [
    {
        path: '/auth/doctors/register',
        element: <DoctorRegisterPage />,
    },
    {
        path: '/auth/caregivers/register',
        element: <CaregiverRegisterPage />,
    },
]
