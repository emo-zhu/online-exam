import assert from 'node:assert/strict'
import test from 'node:test'
import { createPaperSchema } from './paper.schema.js'
import { paperService } from './paper.service.js'
import { paperRepository } from './paper.repository.js'
import { subjectService } from '../subject/subject.service.js'

test('createPaperSchema 支持填空题和应用题', async (t) => {
  const sharedQuestion = {
    subject: 'math',
    title: '<p>题干</p>',
    score: 5,
    options: null,
    answer: '<p>参考答案</p>',
    analysis: '<p>解析</p>'
  }

  await t.test('fill 可通过参数校验', () => {
    const result = createPaperSchema.safeParse({
      paperName: '测试试卷',
      subject: 'math',
      duration: 90,
      questionList: [
        {
          ...sharedQuestion,
          type: 'fill'
        }
      ]
    })

    assert.equal(result.success, true)
  })

  await t.test('application 可通过参数校验', () => {
    const result = createPaperSchema.safeParse({
      paperName: '测试试卷',
      subject: 'math',
      duration: 90,
      questionList: [
        {
          ...sharedQuestion,
          type: 'application'
        }
      ]
    })

    assert.equal(result.success, true)
  })
})

test('paperService.createPaper 支持填空题和应用题作为主观题快照', async (t) => {
  const originalEnsureSubjectExists = subjectService.ensureSubjectExists
  const originalCreatePaper = paperRepository.createPaper
  const originalFindClassesByIds = paperRepository.findClassesByIds
  const originalFindPaperById = paperRepository.findPaperById
  const originalGetSubjectNameMap = subjectService.getSubjectNameMap

  subjectService.ensureSubjectExists = async () => {}
  paperRepository.findClassesByIds = async () => []
  subjectService.getSubjectNameMap = async () => new Map([['math', '数学']])

  t.after(() => {
    subjectService.ensureSubjectExists = originalEnsureSubjectExists
    paperRepository.createPaper = originalCreatePaper
    paperRepository.findClassesByIds = originalFindClassesByIds
    paperRepository.findPaperById = originalFindPaperById
    subjectService.getSubjectNameMap = originalGetSubjectNameMap
  })

  await t.test('fill 快照不要求选项且保留主观题答案', async () => {
    let capturedCreateData = null

    paperRepository.createPaper = async (data) => {
      capturedCreateData = data
      return { id: 201n }
    }
    paperRepository.findPaperById = async () => ({
      id: 201n,
      paperName: '测试试卷',
      subject: 'math',
      totalScore: 5,
      duration: 90,
      startTime: null,
      endTime: null,
      status: 0,
      paperQuestions: [
        {
          id: 301n,
          questionId: null,
          subject: 'math',
          type: 'fill',
          title: '<p>题干</p>',
          score: 5,
          options: null,
          answer: '<p>参考答案</p>',
          analysis: '<p>解析</p>',
          sortOrder: 1
        }
      ],
      paperTargetClasses: [],
      _count: { examRecords: 0 }
    })

    const result = await paperService.createPaper({
      paperName: '测试试卷',
      subject: 'math',
      duration: 90,
      status: 0,
      classIds: [],
      questionList: [
        {
          subject: 'math',
          type: 'fill',
          title: '<p>题干</p>',
          score: 5,
          options: null,
          answer: '<p>参考答案</p>',
          analysis: '<p>解析</p>'
        }
      ]
    }, { id: 1n })

    const snapshot = capturedCreateData?.paperQuestions?.create?.[0]
    assert.equal(snapshot?.type, 'fill')
    assert.equal(snapshot?.options, null)
    assert.equal(snapshot?.answer, '<p>参考答案</p>')
    assert.equal(result.questionList[0].type, 'fill')
  })

  await t.test('application 快照不要求选项且保留主观题答案', async () => {
    let capturedCreateData = null

    paperRepository.createPaper = async (data) => {
      capturedCreateData = data
      return { id: 202n }
    }
    paperRepository.findPaperById = async () => ({
      id: 202n,
      paperName: '应用题试卷',
      subject: 'math',
      totalScore: 10,
      duration: 90,
      startTime: null,
      endTime: null,
      status: 0,
      paperQuestions: [
        {
          id: 302n,
          questionId: null,
          subject: 'math',
          type: 'application',
          title: '<p>题干</p>',
          score: 10,
          options: null,
          answer: '<p>参考答案</p>',
          analysis: '<p>解析</p>',
          sortOrder: 1
        }
      ],
      paperTargetClasses: [],
      _count: { examRecords: 0 }
    })

    const result = await paperService.createPaper({
      paperName: '应用题试卷',
      subject: 'math',
      duration: 90,
      status: 0,
      classIds: [],
      questionList: [
        {
          subject: 'math',
          type: 'application',
          title: '<p>题干</p>',
          score: 10,
          options: null,
          answer: '<p>参考答案</p>',
          analysis: '<p>解析</p>'
        }
      ]
    }, { id: 1n })

    const snapshot = capturedCreateData?.paperQuestions?.create?.[0]
    assert.equal(snapshot?.type, 'application')
    assert.equal(snapshot?.options, null)
    assert.equal(snapshot?.answer, '<p>参考答案</p>')
    assert.equal(result.questionList[0].type, 'application')
  })
})
