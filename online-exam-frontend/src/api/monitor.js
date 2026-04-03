import request from '@/utils/request'

export function getActiveMonitorExams(config = {}) {
    return request({
        url: '/v1/monitor/active-exams',
        method: 'get',
        ...config
    })
}

export function getMonitorExamStudents(paperId, config = {}) {
    return request({
        url: `/v1/monitor/exams/${paperId}/students`,
        method: 'get',
        ...config
    })
}

export function sendMonitorWarn(paperId, data) {
    return request({
        url: `/v1/monitor/exams/${paperId}/warn`,
        method: 'post',
        data
    })
}

export function forceSubmitMonitorStudent(paperId, data) {
    return request({
        url: `/v1/monitor/exams/${paperId}/force-submit`,
        method: 'post',
        data
    })
}

export function getMonitorLogs(params, config = {}) {
    return request({
        url: '/v1/monitor/logs',
        method: 'get',
        params,
        ...config
    })
}
