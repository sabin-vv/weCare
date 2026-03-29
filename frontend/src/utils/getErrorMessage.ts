import axios from 'axios'

export const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || 'server error'
    }
    if (error instanceof Error) {
        return error.message
    }
    return 'Something went wrong'
}
