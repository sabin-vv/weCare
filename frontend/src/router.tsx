import { AuthRoutes } from './modules/auth/routes/auth.routes'
import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([...AuthRoutes])
