import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { logout } from '../api/auth.api'
import { useAuth } from '@/shared/context/AuthContext'
import { getErrorMessage } from '@/utils/getErrorMessage'

export const useLogout = () => {
    const { clearAuth } = useAuth()
    const navigate = useNavigate()

    const handleLogout = useCallback(async () => {
        try {
            await logout()
        } catch (error) {
            const message = getErrorMessage(error)
            toast.error(message || 'Logout failed')
        } finally {
            clearAuth()
            navigate('/auth/login', { replace: true })
            toast.success('Logged out successfully')
        }
    }, [clearAuth, navigate])

    return handleLogout
}
