import type { RouteObject } from 'react-router-dom'

import AdminLayout from '../components/AdminLayout'
import AdminDashboard from '../pages/AdminDashboard'
import CaregiverVerificationPage from '../pages/CaregiverVerificationPage'
import DoctorVerificationPage from '../pages/DoctorVerificationPage'
import UserManagementPage from '../pages/UserManagementPage'

import { Role } from '@/features/auth/types/auth.types'
import RoleProtectedRoute from '@/routes/RoleProtectedRoute'

const AdminRoutes: RouteObject[] = [
    {
        path: '/admin',
        element: <RoleProtectedRoute allowedRoles={[Role.ADMIN]} />,
        children: [
            {
                path: '',
                element: <AdminLayout />,
                children: [
                    { path: 'dashboard', element: <AdminDashboard /> },
                    { path: 'doctor-verification', element: <DoctorVerificationPage /> },
                    { path: 'caregiver-verification', element: <CaregiverVerificationPage /> },
                    { path: 'verified-doctors', element: <div>Verified Doctors Placeholder</div> },
                    { path: 'user-management', element: <UserManagementPage /> },
                    { path: 'activity-logs', element: <div>Activity Logs Placeholder</div> },
                    { path: 'appointments', element: <div>Admin Appointments Management Placeholder</div> },
                ],
            },
        ],
    },
]

export default AdminRoutes
