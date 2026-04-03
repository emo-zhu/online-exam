import request from '@/utils/request'

export function getQuestionCategoryList(params) {
    return request({
        url: '/v1/question-categories',
        method: 'get',
        params
    })
}

export function createQuestionCategory(data) {
    return request({
        url: '/v1/question-categories',
        method: 'post',
        data
    })
}

export function updateQuestionCategory(id, data) {
    return request({
        url: `/v1/question-categories/${id}`,
        method: 'put',
        data
    })
}

export function deleteQuestionCategory(id) {
    return request({
        url: `/v1/question-categories/${id}`,
        method: 'delete'
    })
}
