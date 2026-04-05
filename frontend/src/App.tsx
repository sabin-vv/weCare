import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router-dom'

import { router } from './router'
import { AuthProvider } from './shared/context/AuthContext'
import { PlatformProvider } from './shared/context/PlatformContext'

function App() {
    return (
        <AuthProvider>
            <PlatformProvider>
                <Toaster position="top-center" />
                <RouterProvider router={router} />
            </PlatformProvider>
        </AuthProvider>
    )
}

export default App
