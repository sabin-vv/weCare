import type { RouteObject } from 'react-router-dom'
import CaregiverRegisterPage from '../pages/CaregiverRegisterPage'
import DoctorRegisterPage from '../pages/DoctorRegisterPage'
import LoginPage from '../pages/LoginPage'

export const AuthRoutes: RouteObject[] = [
    {
        path: '/auth/login',
        element: <LoginPage />,
    },
    {
        path: '/auth/doctors/register',
        element: <DoctorRegisterPage />,
    },
    {
        path: '/auth/caregivers/register',
        element: <CaregiverRegisterPage />,
    },
]
