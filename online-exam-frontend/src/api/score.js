import request from '@/utils/request'

export function getScoreList(params) {
    return request({
        url: '/v1/scores',
        method: 'get',
        params
    })
}

export function getScoreStats(params) {
    return request({
        url: '/v1/scores/stats',
        method: 'get',
        params
    })
}

export function exportScoreList(params) {
    return request({
        url: '/v1/scores/export',
        method: 'get',
        params,
        responseType: 'blob'
    })
}
