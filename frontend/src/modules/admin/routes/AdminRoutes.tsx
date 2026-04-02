import type { RouteObject } from 'react-router-dom'

import AdminLayout from '../components/AdminLayout'
import AdminDashboard from '../pages/AdminDashboard'
import AdminLoginPage from '../pages/AdminLoginPage'
import CaregiverVerificationPage from '../pages/CaregiverVerificationPage'
import DoctorVerificationPage from '../pages/DoctorVerificationPage'
import UserManagementPage from '../pages/UserManagementPage'

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
