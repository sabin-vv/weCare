import type { RouteObject } from 'react-router-dom'

import CaregiverRegisterPage from '../pages/CaregiverRegistrationPage'
import DoctorRegisterPage from '../pages/DoctorRegisterPage'
import EmailVerificationPage from '../pages/EmailVerificationPage'
import ForgotPasswordEmailPage from '../pages/ForgotPasswordEmailPage'
import ForgotPasswordNewPasswordPage from '../pages/ForgotPasswordNewPasswordPage'
import ForgotPasswordOtpPage from '../pages/ForgotPasswordOtpPage'
import LoginPage from '../pages/LoginPage'
import PatientRegisterPage from '../pages/PatientRegisterPage'

const AuthRoutes: RouteObject[] = [
    {
        path: '/api/auth/login',
        element: <LoginPage />,
    },
    {
        path: '/api/auth/forgot-password',
        element: <ForgotPasswordEmailPage />,
    },
    {
        path: '/api/auth/forgot-password/verify-otp',
        element: <ForgotPasswordOtpPage />,
    },
    {
        path: '/api/auth/forgot-password/new-password',
        element: <ForgotPasswordNewPasswordPage />,
    },
    {
        path: '/api/doctors/register',
        element: <DoctorRegisterPage />,
    },
    {
        path: '/api/caregivers/register',
        element: <CaregiverRegisterPage />,
    },
    {
        path: '/api/patients/register',
        element: <PatientRegisterPage />,
    },
    {
        path: '/api/verify-email',
        element: <EmailVerificationPage />,
    },
]

export default AuthRoutes
