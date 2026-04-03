import assert from 'node:assert/strict'
import test from 'node:test'
import { monitorService } from './monitor.service.js'
import { monitorRepository } from './monitor.repository.js'
import { examRecordService } from '../examRecord/examRecord.service.js'
import { monitorSseHub } from './monitor.sse.js'

test('monitorService 会广播监控变更事件', async (t) => {
  await t.test('warnStudent 成功后广播 teacher_warn 事件', async () => {
    const originalFindPaperById = monitorRepository.findPaperById
    const originalFindStudentById = monitorRepository.findStudentById
    const originalCreateMonitorLog = monitorRepository.createMonitorLog
    const originalBroadcastChange = monitorSseHub.broadcastChange

    let broadcastPayload = null

    monitorRepository.findPaperById = async () => ({
      id: 11n,
      status: 1,
      startTime: null,
      endTime: null
    })
    monitorRepository.findStudentById = async () => ({
      id: 22n,
      status: 1,
      realName: '张三',
      classId: 1n,
      userRoles: [{ role: { roleCode: 'student' } }]
    })
    monitorRepository.createMonitorLog = async () => ({
      id: 1n,
      paperId: 11n,
      paper: { paperName: '数学期末考试' },
      studentId: 22n,
      student: { realName: '张三' },
      operatorId: 33n,
      operator: { realName: '李老师', username: 'teacher01' },
      type: 'warn',
      content: '请注意纪律',
      result: '成功',
      createdAt: new Date('2026-03-29T10:00:00Z')
    })
    monitorSseHub.broadcastChange = (payload) => {
      broadcastPayload = payload
    }

    try {
      const result = await monitorService.warnStudent(11n, {
        studentId: 22n,
        content: '请注意纪律'
      }, {
        id: 33n
      })

      assert.equal(result.type, 'warn')
      assert.equal(broadcastPayload?.type, 'teacher_warn')
      assert.equal(broadcastPayload?.paperId, '11')
      assert.equal(broadcastPayload?.studentId, '22')
      assert.match(broadcastPayload?.timestamp || '', /^\d{4}-\d{2}-\d{2}T/)
    } finally {
      monitorRepository.findPaperById = originalFindPaperById
      monitorRepository.findStudentById = originalFindStudentById
      monitorRepository.createMonitorLog = originalCreateMonitorLog
      monitorSseHub.broadcastChange = originalBroadcastChange
    }
  })

  await t.test('forceSubmitStudent 成功后广播 teacher_force_submit 事件', async () => {
    const originalFindPaperById = monitorRepository.findPaperById
    const originalFindStudentById = monitorRepository.findStudentById
    const originalCreateMonitorLog = monitorRepository.createMonitorLog
    const originalSubmitStudentExam = examRecordService.submitStudentExam
    const originalBroadcastChange = monitorSseHub.broadcastChange

    let broadcastPayload = null

    monitorRepository.findPaperById = async () => ({
      id: 11n,
      status: 1,
      startTime: null,
      endTime: null
    })
    monitorRepository.findStudentById = async () => ({
      id: 22n,
      status: 1,
      realName: '张三',
      classId: 1n,
      userRoles: [{ role: { roleCode: 'student' } }]
    })
    examRecordService.submitStudentExam = async () => ({
      recordId: 1001n,
      status: 2,
      submitTime: '2026-03-29 18:00:00'
    })
    monitorRepository.createMonitorLog = async () => ({
      id: 2n,
      paperId: 11n,
      paper: { paperName: '数学期末考试' },
      studentId: 22n,
      student: { realName: '张三' },
      operatorId: 33n,
      operator: { realName: '李老师', username: 'teacher01' },
      type: 'force_submit',
      content: '监考老师强制交卷',
      result: '成功',
      createdAt: new Date('2026-03-29T10:00:00Z')
    })
    monitorSseHub.broadcastChange = (payload) => {
      broadcastPayload = payload
    }

    try {
      const result = await monitorService.forceSubmitStudent(11n, {
        studentId: 22n
      }, {
        id: 33n
      })

      assert.equal(result.studentId, 22n)
      assert.equal(broadcastPayload?.type, 'teacher_force_submit')
      assert.equal(broadcastPayload?.paperId, '11')
      assert.equal(broadcastPayload?.studentId, '22')
      assert.match(broadcastPayload?.timestamp || '', /^\d{4}-\d{2}-\d{2}T/)
    } finally {
      monitorRepository.findPaperById = originalFindPaperById
      monitorRepository.findStudentById = originalFindStudentById
      monitorRepository.createMonitorLog = originalCreateMonitorLog
      examRecordService.submitStudentExam = originalSubmitStudentExam
      monitorSseHub.broadcastChange = originalBroadcastChange
    }
  })
})
