import request from '@/utils/request'

export function getUserList(params) {
    return request({
        url: '/v1/users',
        method: 'get',
        params
    })
}

export function createUser(data) {
    return request({
        url: '/v1/users',
        method: 'post',
        data
    })
}

export function importUsers(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request({
        url: '/v1/users/import',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export function exportUsers(params) {
    return request({
        url: '/v1/users/export',
        method: 'get',
        params,
        responseType: 'blob'
    })
}

export function updateUser(id, data) {
    return request({
        url: `/v1/users/${id}`,
        method: 'put',
        data
    })
}

export function updateUserStatus(id, data) {
    return request({
        url: `/v1/users/${id}/status`,
        method: 'patch',
        data
    })
}

export function resetUserPassword(id, data = {}) {
    return request({
        url: `/v1/users/${id}/reset-password`,
        method: 'post',
        data
    })
}

export function deleteUser(id) {
    return request({
        url: `/v1/users/${id}`,
        method: 'delete'
    })
}

export function batchDeleteUsers(ids) {
    return request({
        url: '/v1/users/batch',
        method: 'delete',
        data: { ids }
    })
}
