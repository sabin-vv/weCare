import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router-dom'

import { router } from './router'
import { AuthProvider } from './shared/context/AuthContext'

function App() {
    return (
        <AuthProvider>
            <Toaster position="top-center" />
            <RouterProvider router={router} />
        </AuthProvider>
    )
}

export default App
