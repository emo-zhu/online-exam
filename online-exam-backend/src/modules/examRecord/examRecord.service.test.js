import assert from 'node:assert/strict'
import test from 'node:test'
import { examRecordService } from './examRecord.service.js'
import { examRecordRepository } from './examRecord.repository.js'
import { subjectService } from '../subject/subject.service.js'
import { monitorSseHub } from '../monitor/monitor.sse.js'

test('submitStudentExam 会按场景广播监控事件', async (t) => {
  await t.test('正常交卷后广播 student_submit 事件', async () => {
    const originalFindPaperById = examRecordRepository.findPaperById
    const originalFindRecordByPaperAndStudent = examRecordRepository.findRecordByPaperAndStudent
    const originalFindStudentById = examRecordRepository.findStudentById
    const originalSaveSubmittedRecord = examRecordRepository.saveSubmittedRecord
    const originalGetSubjectNameMap = subjectService.getSubjectNameMap
    const originalBroadcastChange = monitorSseHub.broadcastChange

    let broadcastPayload = null

    examRecordRepository.findPaperById = async () => ({
      id: 11n,
      status: 1,
      paperName: '数学期末考试',
      subject: 'math',
      totalScore: 5,
      startTime: null,
      endTime: null,
      paperTargetClasses: [],
      paperQuestions: [
        {
          id: 101n,
          questionId: 201n,
          type: 'single',
          answer: 'A',
          score: 5
        }
      ]
    })
    examRecordRepository.findRecordByPaperAndStudent = async () => null
    examRecordRepository.findStudentById = async () => ({
      id: 22n,
      class: { className: '一班' }
    })
    examRecordRepository.saveSubmittedRecord = async () => ({
      id: 301n,
      paperId: 11n,
      studentId: 22n,
      examNameSnapshot: '数学期末考试',
      subjectSnapshot: 'math',
      totalScore: 5,
      objectiveScore: 5,
      subjectiveScore: 0,
      status: 2,
      submitTime: new Date('2026-03-29T10:00:00Z')
    })
    subjectService.getSubjectNameMap = async () => new Map([['math', '数学']])
    monitorSseHub.broadcastChange = (payload) => {
      broadcastPayload = payload
    }

    try {
      const result = await examRecordService.submitStudentExam(
        11n,
        {
          answers: [{ paperQuestionId: 101n, answer: 'A' }],
          cheatCount: 0
        },
        {
          id: 22n,
          classId: 1n,
          roles: ['student']
        }
      )

      assert.equal(result.paperId, 11n)
      assert.equal(broadcastPayload?.type, 'student_submit')
      assert.equal(broadcastPayload?.paperId, '11')
      assert.equal(broadcastPayload?.studentId, '22')
      assert.match(broadcastPayload?.timestamp || '', /^\d{4}-\d{2}-\d{2}T/)
    } finally {
      examRecordRepository.findPaperById = originalFindPaperById
      examRecordRepository.findRecordByPaperAndStudent = originalFindRecordByPaperAndStudent
      examRecordRepository.findStudentById = originalFindStudentById
      examRecordRepository.saveSubmittedRecord = originalSaveSubmittedRecord
      subjectService.getSubjectNameMap = originalGetSubjectNameMap
      monitorSseHub.broadcastChange = originalBroadcastChange
    }
  })

  await t.test('强制交卷时不广播 student_submit 事件', async () => {
    const originalFindPaperById = examRecordRepository.findPaperById
    const originalFindRecordByPaperAndStudent = examRecordRepository.findRecordByPaperAndStudent
    const originalFindStudentById = examRecordRepository.findStudentById
    const originalSaveSubmittedRecord = examRecordRepository.saveSubmittedRecord
    const originalGetSubjectNameMap = subjectService.getSubjectNameMap
    const originalBroadcastChange = monitorSseHub.broadcastChange

    let broadcastCalled = false

    examRecordRepository.findPaperById = async () => ({
      id: 11n,
      status: 1,
      paperName: '数学期末考试',
      subject: 'math',
      totalScore: 5,
      startTime: null,
      endTime: null,
      paperTargetClasses: [],
      paperQuestions: [
        {
          id: 101n,
          questionId: 201n,
          type: 'single',
          answer: 'A',
          score: 5
        }
      ]
    })
    examRecordRepository.findRecordByPaperAndStudent = async () => null
    examRecordRepository.findStudentById = async () => ({
      id: 22n,
      class: { className: '一班' }
    })
    examRecordRepository.saveSubmittedRecord = async () => ({
      id: 301n,
      paperId: 11n,
      studentId: 22n,
      examNameSnapshot: '数学期末考试',
      subjectSnapshot: 'math',
      totalScore: 0,
      objectiveScore: 0,
      subjectiveScore: 0,
      status: 2,
      submitTime: new Date('2026-03-29T10:00:00Z')
    })
    subjectService.getSubjectNameMap = async () => new Map([['math', '数学']])
    monitorSseHub.broadcastChange = () => {
      broadcastCalled = true
    }

    try {
      await examRecordService.submitStudentExam(
        11n,
        {
          answers: [],
          forcedSubmit: 1,
          cheatCount: 0
        },
        {
          id: 22n,
          classId: 1n,
          roles: ['student']
        }
      )

      assert.equal(broadcastCalled, false)
    } finally {
      examRecordRepository.findPaperById = originalFindPaperById
      examRecordRepository.findRecordByPaperAndStudent = originalFindRecordByPaperAndStudent
      examRecordRepository.findStudentById = originalFindStudentById
      examRecordRepository.saveSubmittedRecord = originalSaveSubmittedRecord
      subjectService.getSubjectNameMap = originalGetSubjectNameMap
      monitorSseHub.broadcastChange = originalBroadcastChange
    }
  })
})

test('submitStudentExam 会把填空题和应用题当作主观题', async (t) => {
  const originalFindPaperById = examRecordRepository.findPaperById
  const originalFindRecordByPaperAndStudent = examRecordRepository.findRecordByPaperAndStudent
  const originalFindStudentById = examRecordRepository.findStudentById
  const originalSaveSubmittedRecord = examRecordRepository.saveSubmittedRecord
  const originalGetSubjectNameMap = subjectService.getSubjectNameMap
  const originalBroadcastChange = monitorSseHub.broadcastChange

  let capturedSavePayload = null

  examRecordRepository.findPaperById = async () => ({
    id: 21n,
    status: 1,
    paperName: '主观题试卷',
    subject: 'math',
    totalScore: 15,
    startTime: null,
    endTime: null,
    paperTargetClasses: [],
    paperQuestions: [
      {
        id: 201n,
        questionId: 301n,
        type: 'fill',
        answer: '42',
        score: 5
      },
      {
        id: 202n,
        questionId: 302n,
        type: 'application',
        answer: '证明过程',
        score: 10
      }
    ]
  })
  examRecordRepository.findRecordByPaperAndStudent = async () => null
  examRecordRepository.findStudentById = async () => ({
    id: 22n,
    class: { className: '一班' }
  })
  examRecordRepository.saveSubmittedRecord = async (payload) => {
    capturedSavePayload = payload
    return {
      id: 401n,
      paperId: 21n,
      studentId: 22n,
      examNameSnapshot: '主观题试卷',
      subjectSnapshot: 'math',
      totalScore: 0,
      objectiveScore: 0,
      subjectiveScore: 0,
      status: 1,
      submitTime: new Date('2026-03-29T10:00:00Z')
    }
  }
  subjectService.getSubjectNameMap = async () => new Map([['math', '数学']])
  monitorSseHub.broadcastChange = () => {}

  try {
    const result = await examRecordService.submitStudentExam(
      21n,
      {
        answers: [
          { paperQuestionId: 201n, answer: '学生填空答案' },
          { paperQuestionId: 202n, answer: '学生应用题答案' }
        ],
        cheatCount: 0
      },
      {
        id: 22n,
        classId: 1n,
        roles: ['student']
      }
    )

    assert.equal(capturedSavePayload?.status, 1)
    assert.equal(capturedSavePayload?.objectiveScore, 0)
    assert.equal(capturedSavePayload?.answerRows?.length, 2)
    assert.equal(capturedSavePayload?.wrongBookRows?.length, 0)
    assert.equal(result.status, 1)
  } finally {
    examRecordRepository.findPaperById = originalFindPaperById
    examRecordRepository.findRecordByPaperAndStudent = originalFindRecordByPaperAndStudent
    examRecordRepository.findStudentById = originalFindStudentById
    examRecordRepository.saveSubmittedRecord = originalSaveSubmittedRecord
    subjectService.getSubjectNameMap = originalGetSubjectNameMap
    monitorSseHub.broadcastChange = originalBroadcastChange
  }
})

test('submitTeacherMark 会纳入填空题和应用题评分', async () => {
  const originalFindRecordById = examRecordRepository.findRecordById
  const originalSubmitTeacherMark = examRecordRepository.submitTeacherMark

  let capturedMarkPayload = null

  examRecordRepository.findRecordById = async () => ({
    id: 51n,
    studentId: 22n,
    objectiveScore: 20,
    answers: [
      {
        id: 601n,
        paperQuestionId: 701n,
        questionId: 801n,
        answer: '学生填空答案',
        paperQuestion: {
          type: 'fill',
          score: 5,
          answer: '参考答案'
        }
      },
      {
        id: 602n,
        paperQuestionId: 702n,
        questionId: 802n,
        answer: '学生应用题答案',
        paperQuestion: {
          type: 'application',
          score: 10,
          answer: '应用题参考答案'
        }
      }
    ]
  })
  examRecordRepository.submitTeacherMark = async (payload) => {
    capturedMarkPayload = payload
    return {
      id: 51n,
      totalScore: payload.totalScore,
      subjectiveScore: payload.subjectiveScore,
      status: 2,
      markedAt: new Date('2026-03-29T10:30:00Z')
    }
  }

  try {
    const result = await examRecordService.submitTeacherMark(
      51n,
      {
        answers: [
          { answerId: 601n, score: 4, comment: '填空接近正确' },
          { answerId: 602n, score: 8, comment: '思路基本正确' }
        ]
      },
      { id: 1n, roles: ['teacher'] }
    )

    assert.equal(capturedMarkPayload?.answerMarks?.length, 2)
    assert.deepEqual(
      capturedMarkPayload?.textQuestionIds?.map((item) => item.toString()),
      ['701', '702']
    )
    assert.equal(capturedMarkPayload?.subjectiveScore, 12)
    assert.equal(result.totalScore, 32)
  } finally {
    examRecordRepository.findRecordById = originalFindRecordById
    examRecordRepository.submitTeacherMark = originalSubmitTeacherMark
  }
})
