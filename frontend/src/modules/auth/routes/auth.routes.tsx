import type { RouteObject } from 'react-router-dom'
import DoctorRegisterPage from '../pages/DoctorRegisterPage'

export const AuthRoutes: RouteObject[] = [
    {
        path: '/auth/doctors/register',
        element: <DoctorRegisterPage />,
    },
]
