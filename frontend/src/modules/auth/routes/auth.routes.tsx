import type { RouteObject } from 'react-router-dom'
import CaregiverRegisterPage from '../pages/CaregiverRegisterPage'
import DoctorRegisterPage from '../pages/DoctorRegisterPage'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import PatientRegisterPage from '../pages/PatientRegisterPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import ForgotPasswordOtpPage from '../pages/ForgotPasswordOtpPage'
import ForgotPasswordNewPasswordPage from '../pages/ForgotPasswordNewPasswordPage'

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
    {
        path: '/auth/forgot-password',
        element: <ForgotPasswordPage />,
    },
    {
        path: '/auth/forgot-password/verify-otp',
        element: <ForgotPasswordOtpPage />,
    },
    {
        path: '/auth/forgot-password/new-password',
        element: <ForgotPasswordNewPasswordPage />,
    },
]
