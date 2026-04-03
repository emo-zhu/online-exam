import request from '@/utils/request'

export function getClassList(params) {
    return request({
        url: '/v1/classes',
        method: 'get',
        params
    })
}

export function createClass(data) {
    return request({
        url: '/v1/classes',
        method: 'post',
        data
    })
}

export function updateClass(id, data) {
    return request({
        url: `/v1/classes/${id}`,
        method: 'put',
        data
    })
}

export function deleteClass(id) {
    return request({
        url: `/v1/classes/${id}`,
        method: 'delete'
    })
}

export function resetClassCode(id) {
    return request({
        url: `/v1/classes/${id}/reset-code`,
        method: 'post'
    })
}
