import request from '@/utils/request'

export function getQuestionList(params) {
    return request({
        url: '/v1/questions',
        method: 'get',
        params
    })
}

export function createQuestion(data) {
    return request({
        url: '/v1/questions',
        method: 'post',
        data
    })
}

export function updateQuestion(id, data) {
    return request({
        url: `/v1/questions/${id}`,
        method: 'put',
        data
    })
}

export function deleteQuestion(id) {
    return request({
        url: `/v1/questions/${id}`,
        method: 'delete'
    })
}

export function batchDeleteQuestions(ids) {
    return request({
        url: '/v1/questions/batch',
        method: 'delete',
        data: { ids }
    })
}

export function uploadQuestionContentImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request({
        url: '/v1/questions/content-images',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}
