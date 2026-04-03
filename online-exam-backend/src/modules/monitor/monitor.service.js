import { AppError } from '../../common/errors/appError.js'
import { ERROR_CODES } from '../../common/constants/errorCodes.js'
import { formatDateTime } from '../../common/utils/datetime.js'
import { toBigIntId } from '../../common/utils/ids.js'
import { examRecordService } from '../examRecord/examRecord.service.js'
import { monitorRepository } from './monitor.repository.js'
import { createMonitorChangeEvent, monitorSseHub } from './monitor.sse.js'

const getPaperTimeStatus = (paper) => {
  const now = new Date()
  const startTime = paper.startTime ? new Date(paper.startTime) : null
  const endTime = paper.endTime ? new Date(paper.endTime) : null

  if (startTime && startTime > now) {
    return 'not_started'
  }

  if (endTime && endTime < now) {
    return 'ended'
  }

  return 'ongoing'
}

const ensureMonitorablePaper = (paper) => {
  if (!paper || paper.status !== 1) {
    throw new AppError('考试不存在或未发布', {
      code: ERROR_CODES.NOT_FOUND,
      status: 404
    })
  }

  const paperStatus = getPaperTimeStatus(paper)
  if (paperStatus === 'not_started') {
    throw new AppError('考试未开始，暂不可监控', {
      code: ERROR_CODES.CONFLICT,
      status: 409
    })
  }

  if (paperStatus === 'ended') {
    throw new AppError('考试已结束，暂不可监控', {
      code: ERROR_CODES.CONFLICT,
      status: 409
    })
  }
}

const ensureStudent = (student) => {
  const isStudent = student?.userRoles?.some((item) => item.role?.roleCode === 'student')
  if (!student || student.status !== 1 || !isStudent) {
    throw new AppError('考生不存在', {
      code: ERROR_CODES.NOT_FOUND,
      status: 404
    })
  }
}

const calcProgress = (paper, record) => {
  if (record?.submitTime) {
    return 100
  }

  if (!paper.startTime) {
    return 0
  }

  const startTimestamp = new Date(paper.startTime).getTime()
  if (Number.isNaN(startTimestamp)) {
    return 0
  }

  const endTimestamp = paper.endTime
    ? new Date(paper.endTime).getTime()
    : startTimestamp + Number(paper.duration || 0) * 60 * 1000

  if (Number.isNaN(endTimestamp) || endTimestamp <= startTimestamp) {
    return 0
  }

  const now = Date.now()
  if (now <= startTimestamp) {
    return 0
  }

  const ratio = (now - startTimestamp) / (endTimestamp - startTimestamp)
  return Math.max(1, Math.min(Math.round(ratio * 100), 99))
}

const mapActiveExam = (paper, totalStudents) => {
  const submittedCount = paper.examRecords?.length || 0
  const ingCount = Math.max(totalStudents - submittedCount, 0)

  return {
    id: paper.id,
    title: paper.paperName,
    paperName: paper.paperName,
    subject: paper.subject,
    startTime: formatDateTime(paper.startTime),
    endTime: formatDateTime(paper.endTime),
    duration: paper.duration,
    totalStudents,
    onlineCount: ingCount + submittedCount,
    ingCount,
    submittedCount
  }
}

const mapMonitorStudent = (student, paper) => {
  const record = student.examRecords?.[0]
  const latestLogin = student.loginLogs?.[0]
  const loginTime = latestLogin?.loginTime ? new Date(latestLogin.loginTime) : null
  const startTime = paper.startTime ? new Date(paper.startTime) : null

  let status = 'unstart'
  if (record?.submitTime) {
    status = 'submitted'
  } else if (!startTime || (loginTime && loginTime >= startTime)) {
    status = 'ing'
  }

  return {
    studentId: student.id,
    recordId: record?.id || null,
    studentName: student.realName,
    className: student.class?.className || '未分班',
    ip: latestLogin?.ip || '-',
    loginTime: loginTime ? formatDateTime(loginTime) : '-',
    progress: status === 'unstart' ? 0 : calcProgress(paper, record),
    cheatCount: Number(record?.cheatCount || 0),
    status,
    statusText: status === 'submitted'
      ? (Number(record?.forcedSubmit || 0) === 1 ? '已交卷(强制)' : '已交卷')
      : status === 'ing'
        ? '考试中'
        : '未开始'
  }
}

const mapMonitorLog = (item) => ({
  id: item.id,
  paperId: item.paperId,
  examName: item.paper?.paperName || '',
  studentId: item.studentId,
  studentName: item.student?.realName || '全部考生',
  operatorId: item.operatorId,
  operatorName: item.operator?.realName || item.operator?.username || '',
  type: item.type,
  content: item.content,
  result: item.result,
  time: formatDateTime(item.createdAt)
})

export const monitorService = {
  async listActiveExams() {
    const now = new Date()
    const [papers, totalStudents] = await Promise.all([
      monitorRepository.findActiveExams(now),
      monitorRepository.countActiveStudents()
    ])

    return papers.map((paper) => mapActiveExam(paper, totalStudents))
  },

  async listExamStudents(paperIdValue) {
    const paperId = toBigIntId(paperIdValue, 'paperId')
    const paper = await monitorRepository.findPaperById(paperId)
    ensureMonitorablePaper(paper)

    const students = await monitorRepository.findMonitorStudents(paperId)

    return students.map((item) => mapMonitorStudent(item, paper))
  },

  async warnStudent(paperIdValue, payload, currentUser) {
    const paperId = toBigIntId(paperIdValue, 'paperId')
    const studentId = toBigIntId(payload.studentId, 'studentId')

    const [paper, student] = await Promise.all([
      monitorRepository.findPaperById(paperId),
      monitorRepository.findStudentById(studentId)
    ])

    ensureMonitorablePaper(paper)
    ensureStudent(student)

    const created = await monitorRepository.createMonitorLog({
      paperId,
      studentId,
      operatorId: currentUser.id,
      type: 'warn',
      content: payload.content,
      result: '成功'
    })

    monitorSseHub.broadcastChange(createMonitorChangeEvent('teacher_warn', {
      paperId,
      studentId
    }))

    return mapMonitorLog(created)
  },

  async forceSubmitStudent(paperIdValue, payload, currentUser) {
    const paperId = toBigIntId(paperIdValue, 'paperId')
    const studentId = toBigIntId(payload.studentId, 'studentId')

    const [paper, student] = await Promise.all([
      monitorRepository.findPaperById(paperId),
      monitorRepository.findStudentById(studentId)
    ])

    ensureMonitorablePaper(paper)
    ensureStudent(student)

    const submitResult = await examRecordService.submitStudentExam(
      paperId,
      {
        answers: [],
        cheatCount: 0,
        forcedSubmit: 1
      },
      {
        id: studentId,
        classId: student.classId,
        roles: ['student']
      }
    )

    const log = await monitorRepository.createMonitorLog({
      paperId,
      studentId,
      operatorId: currentUser.id,
      type: 'force_submit',
      content: '监考老师强制交卷',
      result: '成功'
    })

    monitorSseHub.broadcastChange(createMonitorChangeEvent('teacher_force_submit', {
      paperId,
      studentId
    }))

    return {
      recordId: submitResult.recordId,
      studentId,
      studentName: student.realName,
      status: submitResult.status,
      submitTime: submitResult.submitTime,
      log: mapMonitorLog(log)
    }
  },

  async listLogs(query) {
    const where = {}
    if (query.paperId) {
      where.paperId = toBigIntId(query.paperId, 'paperId')
    }

    const take = Math.min(Math.max(Number(query.pageSize) || 100, 1), 200)
    const list = await monitorRepository.findMonitorLogs({ where, take })
    return list.map(mapMonitorLog)
  }
}
