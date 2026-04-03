import axios from 'axios'
import { ElMessage } from '@/utils/element-plus'
import { refreshToken as refreshTokenApi } from '@/api/auth'
import { getToken, getRefreshToken, setToken, handleAuthExpired } from '@/utils/auth'

const service = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 5000
})

let refreshPromise = null

const shouldTryRefresh = (error) => {
    const status = error.response?.status
    const config = error.config || {}
    if (status !== 401) return false
    if (config.skipAuthRefresh) return false
    if (config._retry) return false
    return Boolean(getRefreshToken())
}

const refreshAccessToken = async () => {
    if (!refreshPromise) {
        refreshPromise = refreshTokenApi({ refreshToken: getRefreshToken() })
            .then((res) => {
                const nextToken = res.data?.token || ''
                if (!nextToken) {
                    throw new Error('刷新登录状态失败')
                }
                setToken(nextToken)
                return nextToken
            })
            .finally(() => {
                refreshPromise = null
            })
    }
    return refreshPromise
}

service.interceptors.request.use(
    config => {
        const token = getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

service.interceptors.response.use(
    response => {
        const responseType = response.config?.responseType
        if (responseType === 'blob' || responseType === 'arraybuffer') {
            return response
        }

        const res = response.data
        if (res.code !== 200) {
            if (!response.config?.silent) {
                ElMessage({
                    message: res.message || '请求失败',
                    type: 'error',
                    duration: 5 * 1000
                })
            }
            return Promise.reject(new Error(res.message || '请求失败'))
        }
        return res
    },
    async error => {
        const config = error.config || {}

        if (shouldTryRefresh(error)) {
            try {
                const nextToken = await refreshAccessToken()
                config._retry = true
                config.headers = config.headers || {}
                config.headers.Authorization = `Bearer ${nextToken}`
                return service(config)
            } catch {
                await handleAuthExpired()
            }
        } else if (error.response?.status === 401) {
            await handleAuthExpired()
        }

        const message = error.response?.data?.message || error.message || '请求失败'
        if (!config.silent) {
            ElMessage({
                message,
                type: 'error',
                duration: 5 * 1000
            })
        }
        return Promise.reject(error)
    }
)

export default service
