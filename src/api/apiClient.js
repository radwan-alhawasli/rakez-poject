import axios from 'axios'
import appConfig from '../config/appConfig'
import logger from '../utils/logger'

const apiBaseUrl = appConfig.apiBaseUrl || '/api'

const apiClient = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 10000
})

// Request Interceptor: Attach token if it exists
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response Interceptor: Standardized error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response ? error.response.status : null

        if (status === 401) {
            // Unauthorized: Token might be expired
            logger.warn('Unauthorized access - potential token expiration')
            // authService.logout() // Optional: auto-logout on 401
        }

        const message = error.response?.data?.message || error.message || 'An unexpected error occurred'
        logger.error(`API Error [${status}]:`, message)

        return Promise.reject({
            status,
            message,
            data: error.response?.data
        })
    }
)

export default apiClient
