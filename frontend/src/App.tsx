import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './shared/context/AuthContext'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

function App() {
    return (
        <AuthProvider>
            <Toaster position="top-center" />
            <RouterProvider router={router} />
        </AuthProvider>
    )
}

export default App
