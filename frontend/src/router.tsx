import { createBrowserRouter } from 'react-router-dom'
import AuthRoutes from './features/auth/routes/AuthRoutes'

export const router = createBrowserRouter([...AuthRoutes])
