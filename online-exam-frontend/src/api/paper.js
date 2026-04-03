import request from '@/utils/request'

export function getPaperList(params) {
    return request({
        url: '/v1/papers',
        method: 'get',
        params
    })
}

export function getPaperDetail(id) {
    return request({
        url: `/v1/papers/${id}`,
        method: 'get'
    })
}

export function createPaper(data) {
    return request({
        url: '/v1/papers',
        method: 'post',
        data
    })
}

export function updatePaper(id, data) {
    return request({
        url: `/v1/papers/${id}`,
        method: 'put',
        data
    })
}

export function updatePaperStatus(id, data) {
    return request({
        url: `/v1/papers/${id}/status`,
        method: 'patch',
        data
    })
}

export function deletePaper(id) {
    return request({
        url: `/v1/papers/${id}`,
        method: 'delete'
    })
}
