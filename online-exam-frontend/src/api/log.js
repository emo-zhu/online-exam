import request from '@/utils/request'

export function getLoginLogList(params) {
    return request({
        url: '/v1/login-logs',
        method: 'get',
        params
    })
}

export function clearLoginLogs() {
    return request({
        url: '/v1/login-logs/clear',
        method: 'delete'
    })
}
