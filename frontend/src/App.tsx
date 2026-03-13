import { RouterProvider } from 'react-router-dom'
import './App.css'
import { router } from './router'
import { Toaster } from 'react-hot-toast'

const App = () => {
    return (
        <>
            <Toaster position="top-center" />
            <RouterProvider router={router} />
        </>
    )
}

export default App
