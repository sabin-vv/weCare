import type { RouteObject } from 'react-router-dom'

import CaregiverActivityLog from '../pages/CaregiverActivityLog'
import CaregiverAlertsPage from '../pages/CaregiverAlertsPage'
import CaregiverDashboard from '../pages/CaregiverDashboard'
import CaregiverPatients from '../pages/CaregiverPatients'
import CaregiverReminders from '../pages/CaregiverReminders'
import CaregiverSettings from '../pages/CaregiverSettings'
import PrescriptionPage from '../pages/PrescriptionPage'

import CaregiverLayout from '@/layout/CaregiverLayout'
import { Role } from '@/modules/auth/types/auth.types'
import ProtectedRoute from '@/shared/components/ProtectedRoute/ProtectedRoute'

export const CaregiverRoutes: RouteObject[] = [
    {
        path: '/caregiver',
        element: (
            <ProtectedRoute allowedRoles={[Role.CAREGIVER]}>
                <CaregiverLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: 'dashboard',
                element: <CaregiverDashboard />,
            },
            {
                path: 'patients',
                element: <CaregiverPatients />,
            },
            {
                path: 'patients/:patientId/prescription',
                element: <PrescriptionPage />,
            },
            {
                path: 'reminders',
                element: <CaregiverReminders />,
            },
            {
                path: 'alerts',
                element: <CaregiverAlertsPage />,
            },
            {
                path: 'activity-log',
                element: <CaregiverActivityLog />,
            },
            {
                path: 'settings',
                element: <CaregiverSettings />,
            },
        ],
    },
]
