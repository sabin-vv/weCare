import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router-dom'

import { router } from './router'
import { AuthProvider } from './shared/context/AuthContext'
import { PlatformProvider } from './shared/context/PlatformContext'
import { SocketProvider } from './shared/context/SocketContext'

function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <PlatformProvider>
                    <Toaster position="top-center" />
                    <RouterProvider router={router} />
                </PlatformProvider>
            </SocketProvider>
        </AuthProvider>
    )
}

export default App
