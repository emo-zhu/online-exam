const TokenKey = 'Admin-Token'
const RefreshTokenKey = 'Admin-Refresh-Token'
let authExpiredHandler = null

const redirectToLogin = () => {
    if (typeof window === 'undefined' || window.location.pathname === '/login') {
        return
    }

    const redirect = `${window.location.pathname}${window.location.search || ''}${window.location.hash || ''}`
    window.location.replace(`/login?redirect=${encodeURIComponent(redirect)}`)
}

export function getToken() {
    return localStorage.getItem(TokenKey)
}

export function setToken(token) {
    return localStorage.setItem(TokenKey, token)
}

export function removeToken() {
    return localStorage.removeItem(TokenKey)
}

export function getRefreshToken() {
    return localStorage.getItem(RefreshTokenKey)
}

export function setRefreshToken(token) {
    return localStorage.setItem(RefreshTokenKey, token)
}

export function removeRefreshToken() {
    return localStorage.removeItem(RefreshTokenKey)
}

export function clearAuthStorage() {
    removeToken()
    removeRefreshToken()
}

export function setAuthExpiredHandler(handler) {
    authExpiredHandler = handler
}

export async function callAuthExpiredHandler() {
    if (typeof authExpiredHandler === 'function') {
        await authExpiredHandler()
    }
}

export async function handleAuthExpired() {
    clearAuthStorage()

    try {
        await callAuthExpiredHandler()
    } catch (error) {
        console.error('清理登录状态失败', error)
    }

    redirectToLogin()
}
