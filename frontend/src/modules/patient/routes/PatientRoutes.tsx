import type { RouteObject } from 'react-router-dom'

import CareTeamPage from '../pages/CareTeamPage'
import DoctorAvailabilityPage from '../pages/DoctorAvailabilityPage'
import DoctorBookingPage from '../pages/DoctorBookingPage'
import PatientAppointmentsPage from '../pages/PatientAppointmentsPage'
import PatientDashboardPage from '../pages/PatientDashboardPage'
import PatientSettings from '../pages/PatientSettings'
import WalletPage from '../pages/WalletPage'

import { Role } from '@/modules/auth/types/auth.types'
import ProtectedRoute from '@/shared/components/ProtectedRoute/ProtectedRoute'

export const PatientRoutes: RouteObject[] = [
    {
        path: '/dashboard',
        element: (
            <ProtectedRoute allowedRoles={[Role.PATIENT]}>
                <PatientDashboardPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/doctors',
        element: (
            <ProtectedRoute allowedRoles={[Role.PATIENT]}>
                <DoctorBookingPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/doctors/:doctorId',
        element: (
            <ProtectedRoute allowedRoles={[Role.PATIENT]}>
                <DoctorAvailabilityPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/doctors/:doctorId/reschedule/:appointmentId',
        element: (
            <ProtectedRoute allowedRoles={[Role.PATIENT]}>
                <DoctorAvailabilityPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/appointments',
        element: (
            <ProtectedRoute allowedRoles={[Role.PATIENT]}>
                <PatientAppointmentsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/settings',
        element: (
            <ProtectedRoute allowedRoles={[Role.PATIENT]}>
                <PatientSettings />
            </ProtectedRoute>
        ),
    },
    {
        path: '/wallet',
        element: (
            <ProtectedRoute allowedRoles={[Role.PATIENT]}>
                <WalletPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/care-team',
        element: (
            <ProtectedRoute allowedRoles={[Role.PATIENT]}>
                <CareTeamPage />
            </ProtectedRoute>
        ),
    },
]
