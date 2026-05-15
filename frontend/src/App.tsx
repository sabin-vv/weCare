import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router-dom'

import { router } from './router'
import { AuthProvider } from './shared/context/AuthContext'
import { NotificationCountProvider } from './shared/context/NotificationCountContext'
import { PlatformProvider } from './shared/context/PlatformContext'

function App() {
    return (
        <AuthProvider>
            <PlatformProvider>
                <NotificationCountProvider>
                    <Toaster position="top-center" />
                    <RouterProvider router={router} />
                </NotificationCountProvider>
            </PlatformProvider>
        </AuthProvider>
    )
}

export default App
