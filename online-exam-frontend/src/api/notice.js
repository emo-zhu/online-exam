import request from '@/utils/request'

export function getNoticeList(params) {
    return request({
        url: '/v1/notices',
        method: 'get',
        params
    })
}

export function createNotice(data) {
    return request({
        url: '/v1/notices',
        method: 'post',
        data
    })
}

export function updateNotice(id, data) {
    return request({
        url: `/v1/notices/${id}`,
        method: 'put',
        data
    })
}

export function deleteNotice(id) {
    return request({
        url: `/v1/notices/${id}`,
        method: 'delete'
    })
}
