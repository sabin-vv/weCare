import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router-dom'
import './App.css'

import { router } from './router'
import { AuthProvider } from './shared/context/AuthContext'

const App = () => {
    return (
        <AuthProvider>
            <Toaster position="top-center" />
            <RouterProvider router={router} />
        </AuthProvider>
    )
}

export default App
