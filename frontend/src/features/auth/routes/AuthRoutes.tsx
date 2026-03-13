import type { RouteObject } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import DoctorRegisterPage from '../pages/DoctorRegisterPage'

const AuthRoutes: RouteObject[] = [
    {
        path: '/api/auth/login',
        element: <LoginPage />,
    },
    {
        path: '/api/doctors/register',
        element: <DoctorRegisterPage />,
    },
]

export default AuthRoutes
