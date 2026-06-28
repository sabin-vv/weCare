import type { RouteObject } from 'react-router-dom'

import DoctorAvailabilityPage from '../../public/pages/DoctorAvailabilityPage'
import CareTeamPage from '../pages/CareTeamPage'
import PatientAppointmentDetailPage from '../pages/PatientAppointmentDetailPage'
import PatientAppointmentsPage from '../pages/PatientAppointmentsPage'
import PatientDashboardPage from '../pages/PatientDashboardPage'
import PatientSettings from '../pages/PatientSettings'
import WalletPage from '../pages/WalletPage'

import PatientLayout from '@/layout/PatientLayout'
import { Role } from '@/modules/auth/types/auth.types'
import ProtectedRoute from '@/shared/components/ProtectedRoute/ProtectedRoute'

export const PatientRoutes: RouteObject[] = [
    {
        path: '/',
        element: (
            <ProtectedRoute allowedRoles={[Role.PATIENT]}>
                <PatientLayout />
            </ProtectedRoute>
        ),

        children: [
            {
                path: '/dashboard',
                element: <PatientDashboardPage />,
            },
            {
                path: '/doctors/:doctorId/reschedule/:appointmentId',
                element: <DoctorAvailabilityPage />,
            },
            {
                path: '/appointments/:appointmentId',
                element: <PatientAppointmentDetailPage />,
            },
            {
                path: '/appointments',
                element: <PatientAppointmentsPage />,
            },
            {
                path: '/settings',
                element: <PatientSettings />,
            },
            {
                path: '/wallet',
                element: <WalletPage />,
            },
            {
                path: '/care-team',
                element: <CareTeamPage />,
            },
        ],
    },
]
