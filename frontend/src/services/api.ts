import { HTTP_STATUS } from '@/shared/constants/http'
import axios from 'axios'

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
            window.location.href = '/auth/login'
        }

        return Promise.reject(error)
    },
)
