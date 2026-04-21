import type { RouteObject } from 'react-router-dom'

import DoctorAvailabilityPage from '../pages/DoctorAvailabilityPage'
import DoctorBookingPage from '../pages/DoctorBookingPage'

export const PatientRoutes: RouteObject[] = [
    {
        path: '/appointments',
        element: <DoctorBookingPage />,
    },
    {
        path: '/appointments/doctor/:doctorId',
        element: <DoctorAvailabilityPage />,
    },
]
