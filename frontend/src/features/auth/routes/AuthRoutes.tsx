import type { RouteObject } from 'react-router-dom'

import CaregiverRegisterPage from '../pages/CaregiverRegistrationPage'
import DoctorRegisterPage from '../pages/DoctorRegisterPage'
import LoginPage from '../pages/LoginPage'

const AuthRoutes: RouteObject[] = [
    {
        path: '/api/auth/login',
        element: <LoginPage />,
    },
    {
        path: '/api/doctors/register',
        element: <DoctorRegisterPage />,
    },
    {
        path: '/api/caregivers/register',
        element: <CaregiverRegisterPage />,
    },
]

export default AuthRoutes
