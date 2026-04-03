import request from '@/utils/request'

export function getStudentExamList() {
    return request({
        url: '/v1/student/exams',
        method: 'get'
    })
}

export function getStudentExamDetail(paperId) {
    return request({
        url: `/v1/student/exams/${paperId}`,
        method: 'get'
    })
}

export function startStudentExam(paperId) {
    return request({
        url: `/v1/student/exams/${paperId}/start`,
        method: 'post'
    })
}

export function autosaveStudentExamRecord(recordId, data, config = {}) {
    return request({
        url: `/v1/student/exam-records/${recordId}/autosave`,
        method: 'post',
        data,
        ...config
    })
}

export function submitStudentExam(paperId, data) {
    return request({
        url: `/v1/student/exams/${paperId}/submit`,
        method: 'post',
        data
    })
}

export function getStudentScoreList() {
    return request({
        url: '/v1/student/scores',
        method: 'get'
    })
}

export function getStudentAnalysisDetail(recordId) {
    return request({
        url: `/v1/student/analysis/${recordId}`,
        method: 'get'
    })
}

export function getWrongBookList() {
    return request({
        url: '/v1/wrong-books',
        method: 'get'
    })
}

export function deleteWrongBook(id) {
    return request({
        url: `/v1/wrong-books/${id}`,
        method: 'delete'
    })
}

export function getExamRecordList(params) {
    return request({
        url: '/v1/exam-records',
        method: 'get',
        params
    })
}

export function getExamRecordDetail(id) {
    return request({
        url: `/v1/exam-records/${id}`,
        method: 'get'
    })
}

export function submitExamRecordMark(id, data) {
    return request({
        url: `/v1/exam-records/${id}/mark`,
        method: 'post',
        data
    })
}
