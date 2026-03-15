import { createBrowserRouter } from 'react-router-dom'

import AuthRoutes from './features/auth/routes/AuthRoutes'
import LandingPage from './features/landing/pages/LandingPage'

export const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />,
    },
    ...AuthRoutes,
])
