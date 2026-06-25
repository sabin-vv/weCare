import type { RouteObject } from 'react-router-dom'

import AdminLayout from '../../../layout/AdminLayout'
import ActivityLogsPage from '../pages/ActivityLogsPage'
import AdminAppointmentsPage from '../pages/AdminAppointmentsPage'
import AdminDashboard from '../pages/AdminDashboard'
import AdminLoginPage from '../pages/AdminLoginPage'
import AdminPaymentsPage from '../pages/AdminPaymentsPage'
import AdminSettings from '../pages/AdminSettings'
import CaregiverVerificationPage from '../pages/CaregiverVerificationPage'
import DoctorVerificationPage from '../pages/DoctorVerificationPage'
import UserManagementPage from '../pages/UserManagementPage'

import { Role } from '@/modules/auth/types/auth.types'
import ProtectedRoute from '@/shared/components/ProtectedRoute/ProtectedRoute'

export const AdminRoutes: RouteObject[] = [
    {
        path: '/auth/admin/login',
        element: <AdminLoginPage />,
    },
    {
        path: '/admin',
        element: (
            <ProtectedRoute allowedRoles={[Role.ADMIN]} loginPath="/auth/admin/login">
                <AdminLayout />
            </ProtectedRoute>
        ),
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
            {
                path: 'settings',
                element: <AdminSettings />,
            },
            {
                path: 'appointments',
                element: <AdminAppointmentsPage />,
            },
            {
                path: 'payments',
                element: <AdminPaymentsPage />,
            },
            {
                path: 'activity-logs',
                element: <ActivityLogsPage />,
            },
        ],
    },
]
