import type { RouteObject } from 'react-router-dom'

import DoctorAvailabilityPage from '../pages/DoctorAvailabilityPage'
import DoctorBookingPage from '../pages/DoctorBookingPage'
import LandingPage from '../pages/LandingPage'

import PublicLayout from '@/layout/PublicLayout'

export const PublicRoutes: RouteObject[] = [
    {
        path: '/',
        element: <PublicLayout />,

        children: [
            {
                path: '/',
                element: <LandingPage />,
            },
            {
                path: '/doctors',
                element: <DoctorBookingPage />,
            },
            {
                path: '/doctors/:doctorId',
                element: <DoctorAvailabilityPage />,
            },
        ],
    },
]
