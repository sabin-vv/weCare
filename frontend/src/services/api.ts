import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'

import { HTTP_STATUS } from '@/shared/constants/http'
import { clearStoredUser } from '@/utils/authStorage'

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean
}

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
})

interface FailedRequest {
    resolve: () => void
    reject: (error: unknown) => void
}

let isRefreshing = false
let failedQueue: FailedRequest[] = []

const processQueue = (error: unknown) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve()
        }
    })

    failedQueue = []
}

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomInternalAxiosRequestConfig

        if (!originalRequest) {
            return Promise.reject(error)
        }

        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
            if (originalRequest.url === '/auth/refresh-token') {
                clearStoredUser()
                toast.error('Your session expired. Please log in.')
                window.location.href = '/auth/login'
                return Promise.reject(error)
            }

            if (isRefreshing) {
                return new Promise<void>((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                })
                    .then(() => {
                        return api(originalRequest)
                    })
                    .catch((err: unknown) => {
                        return Promise.reject(err)
                    })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                await api.post('/auth/refresh-token')
                processQueue(null)
                isRefreshing = false
                return api(originalRequest)
            } catch (refreshError: unknown) {
                processQueue(refreshError)
                isRefreshing = false
                clearStoredUser()
                toast.error('Your session expired. Please log in.')
                window.location.href = '/auth/login'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    },
)
