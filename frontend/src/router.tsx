import { AuthRoutes } from './modules/auth/routes/auth.routes'
import { AdminRoutes } from './modules/admin/routes/AdminRoutes'
import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
    ...AuthRoutes,
    ...AdminRoutes,
])
