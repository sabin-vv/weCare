import type { RouteObject } from 'react-router-dom'
import AdminLoginPage from '../pages/AdminLoginPage'
import AdminDashboard from '../pages/AdminDashboard'
import UserManagementPage from '../pages/UserManagementPage'
import DoctorVerificationPage from '../pages/DoctorVerificationPage'
import CaregiverVerificationPage from '../pages/CaregiverVerificationPage'
import AdminLayout from '../components/AdminLayout'

export const AdminRoutes: RouteObject[] = [
    {
        path: '/auth/admin/login',
        element: <AdminLoginPage />,
    },
    {
        path: '/admin',
        element: <AdminLayout />,
        children: [
            {
                path: 'dashboard',
                element: <AdminDashboard />,
            },
            {
                path: 'users',
                element: <UserManagementPage />,
            },
            {
                path: 'doctors/verification',
                element: <DoctorVerificationPage />,
            },
            {
                path: 'caregivers/verification',
                element: <CaregiverVerificationPage />,
            },
        ],
    },
]
