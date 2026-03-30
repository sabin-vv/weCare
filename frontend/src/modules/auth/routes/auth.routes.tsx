import type { RouteObject } from 'react-router-dom'
import CaregiverRegisterPage from '../pages/CaregiverRegisterPage'
import DoctorRegisterPage from '../pages/DoctorRegisterPage'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import PatientRegisterPage from '../pages/PatientRegisterPage'

export const AuthRoutes: RouteObject[] = [
    {
        path: '/',
        element: <LandingPage />,
    },
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
    {
        path: '/auth/patients/register',
        element: <PatientRegisterPage />,
    },
]
