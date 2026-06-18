import type { RouteObject } from 'react-router-dom'

import AlertPage from '../pages/AlertPage'
import AvailabilityPage from '../pages/AvailabilityPage'
import DoctorAppointmentsPage from '../pages/DoctorAppointmentsPage'
import DoctorDashboard from '../pages/DoctorDashboard'
import DoctorSettings from '../pages/DoctorSettings'
import PatientList from '../pages/PatientList'
import PatientMedicalRecordPage from '../pages/PatientMedicalRecordPage'
import PatientViewPage from '../pages/PatientViewPage'

import { Role } from '@/modules/auth/types/auth.types'
import ProtectedRoute from '@/shared/components/ProtectedRoute/ProtectedRoute'

export const DoctorRoutes: RouteObject[] = [
    {
        path: '/doctor/dashboard',
        element: (
            <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
                <DoctorDashboard />
            </ProtectedRoute>
        ),
    },
    {
        path: '/doctor/settings',
        element: (
            <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
                <DoctorSettings />
            </ProtectedRoute>
        ),
    },
    {
        path: '/doctor/availability',
        element: (
            <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
                <AvailabilityPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/doctor/appointments',
        element: (
            <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
                <DoctorAppointmentsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/doctor/patients',
        element: (
            <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
                <PatientList />
            </ProtectedRoute>
        ),
    },
    {
        path: '/doctor/patients/:patientId',
        element: (
            <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
                <PatientViewPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/doctor/patients/:patientId/medical-record',
        element: (
            <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
                <PatientMedicalRecordPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/doctor/alerts',
        element: (
            <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
                <AlertPage />
            </ProtectedRoute>
        ),
    },
]
