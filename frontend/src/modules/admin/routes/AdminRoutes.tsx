import type { RouteObject } from 'react-router-dom'
import AdminLoginPage from '../pages/AdminLoginPage'
import AdminDashboard from '../pages/AdminDashboard'
import UserManagementPage from '../pages/UserManagementPage'
import DoctorVerificationPage from '../pages/DoctorVerificationPage'
import CaregiverVerificationPage from '../pages/CaregiverVerificationPage'

export const AdminRoutes: RouteObject[] = [
    {
        path: '/auth/admin/login',
        element: <AdminLoginPage />,
    },
    {
        path: '/auth/admin/dashboard',
        element: <AdminDashboard />,
    },
    {
        path: '/auth/admin/users',
        element: <UserManagementPage />,
    },
    {
        path: '/auth/admin/doctors/verification',
        element: <DoctorVerificationPage />,
    },
    {
        path: '/auth/admin/caregivers/verification',
        element: <CaregiverVerificationPage />,
    },
]
