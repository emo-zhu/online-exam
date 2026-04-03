import request from '@/utils/request'

export function getSubjectList(params) {
    return request({
        url: '/v1/subjects',
        method: 'get',
        params
    })
}

export function createSubject(data) {
    return request({
        url: '/v1/subjects',
        method: 'post',
        data
    })
}

export function updateSubject(id, data) {
    return request({
        url: `/v1/subjects/${id}`,
        method: 'put',
        data
    })
}

export function deleteSubject(id) {
    return request({
        url: `/v1/subjects/${id}`,
        method: 'delete'
    })
}
