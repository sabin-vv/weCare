import type { RouteObject } from 'react-router-dom'

import AlertPage from '../pages/AlertPage'
import AvailabilityPage from '../pages/AvailabilityPage'
import DoctorAppointmentsPage from '../pages/DoctorAppointmentsPage'
import DoctorDashboard from '../pages/DoctorDashboard'
import DoctorSettings from '../pages/DoctorSettings'
import PatientList from '../pages/PatientList'
import PatientMedicalRecordPage from '../pages/PatientMedicalRecordPage'
import PatientViewPage from '../pages/PatientViewPage'

import DoctorLayout from '@/layout/DoctorLayout'
import { Role } from '@/modules/auth/types/auth.types'
import ProtectedRoute from '@/shared/components/ProtectedRoute/ProtectedRoute'

export const DoctorRoutes: RouteObject[] = [
    {
        path: '/doctor',
        element: (
            <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
                <DoctorLayout />
            </ProtectedRoute>
        ),

        children: [
            {
                path: '/doctor/dashboard',
                element: <DoctorDashboard />,
            },
            {
                path: '/doctor/settings',
                element: <DoctorSettings />,
            },
            {
                path: '/doctor/availability',
                element: <AvailabilityPage />,
            },
            {
                path: '/doctor/appointments',
                element: <DoctorAppointmentsPage />,
            },
            {
                path: '/doctor/patients',
                element: <PatientList />,
            },
            {
                path: '/doctor/patients/:patientId',
                element: <PatientViewPage />,
            },
            {
                path: '/doctor/patients/:patientId/medical-record',
                element: <PatientMedicalRecordPage />,
            },
            {
                path: '/doctor/alerts',
                element: <AlertPage />,
            },
        ],
    },
]
