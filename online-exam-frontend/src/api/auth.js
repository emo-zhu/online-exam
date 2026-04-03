import request from '@/utils/request'

export function getCaptcha() {
    return request({
        url: '/v1/auth/captcha',
        method: 'get'
    })
}

export function login(data) {
    return request({
        url: '/v1/auth/login',
        method: 'post',
        data
    })
}

export function register(data) {
    return request({
        url: '/v1/auth/register',
        method: 'post',
        data
    })
}

export function getCurrentUser() {
    return request({
        url: '/v1/auth/me',
        method: 'get'
    })
}

export function logout(data = {}) {
    return request({
        url: '/v1/auth/logout',
        method: 'post',
        data
    })
}

export function refreshToken(data) {
    return request({
        url: '/v1/auth/refresh-token',
        method: 'post',
        data,
        skipAuthRefresh: true,
        silent: true
    })
}

export function changePassword(data) {
    return request({
        url: '/v1/auth/password',
        method: 'put',
        data
    })
}
