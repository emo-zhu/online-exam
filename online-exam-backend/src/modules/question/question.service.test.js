import assert from 'node:assert/strict'
import test from 'node:test'
import { createQuestionSchema } from './question.schema.js'
import { questionService } from './question.service.js'
import { questionRepository } from './question.repository.js'
import { subjectService } from '../subject/subject.service.js'

test('createQuestionSchema 支持填空题和应用题', async (t) => {
  const sharedPayload = {
    subject: 'math',
    categoryId: null,
    title: '<p>题干</p>',
    score: 5,
    options: null,
    answer: '<p>参考答案</p>',
    analysis: '<p>解析</p>'
  }

  await t.test('fill 可通过参数校验', () => {
    const result = createQuestionSchema.safeParse({
      ...sharedPayload,
      type: 'fill'
    })

    assert.equal(result.success, true)
  })

  await t.test('application 可通过参数校验', () => {
    const result = createQuestionSchema.safeParse({
      ...sharedPayload,
      type: 'application'
    })

    assert.equal(result.success, true)
  })
})

test('questionService.createQuestion 支持填空题和应用题作为主观题', async (t) => {
  const originalEnsureSubjectExists = subjectService.ensureSubjectExists
  const originalGetSubjectNameMap = subjectService.getSubjectNameMap
  const originalCreateQuestion = questionRepository.createQuestion

  subjectService.ensureSubjectExists = async () => {}
  subjectService.getSubjectNameMap = async () => new Map([['math', '数学']])

  t.after(() => {
    subjectService.ensureSubjectExists = originalEnsureSubjectExists
    subjectService.getSubjectNameMap = originalGetSubjectNameMap
    questionRepository.createQuestion = originalCreateQuestion
  })

  await t.test('createQuestion 支持 fill', async () => {
    let capturedCreateData = null

    questionRepository.createQuestion = async (data) => {
      capturedCreateData = data
      return {
        id: 101n,
        ...data,
        category: null
      }
    }

    const result = await questionService.createQuestion({
      subject: 'math',
      categoryId: null,
      type: 'fill',
      title: '<p>题干</p>',
      score: 5,
      options: null,
      answer: '<p>参考答案</p>',
      analysis: '<p>解析</p>'
    })

    assert.equal(capturedCreateData?.type, 'fill')
    assert.equal(capturedCreateData?.options, null)
    assert.equal(capturedCreateData?.answer, '<p>参考答案</p>')
    assert.equal(result.type, 'fill')
    assert.equal(result.answer, '<p>参考答案</p>')
  })

  await t.test('createQuestion 支持 application', async () => {
    let capturedCreateData = null

    questionRepository.createQuestion = async (data) => {
      capturedCreateData = data
      return {
        id: 102n,
        ...data,
        category: null
      }
    }

    const result = await questionService.createQuestion({
      subject: 'math',
      categoryId: null,
      type: 'application',
      title: '<p>题干</p>',
      score: 10,
      options: null,
      answer: '<p>参考答案</p>',
      analysis: '<p>解析</p>'
    })

    assert.equal(capturedCreateData?.type, 'application')
    assert.equal(capturedCreateData?.options, null)
    assert.equal(capturedCreateData?.answer, '<p>参考答案</p>')
    assert.equal(result.type, 'application')
    assert.equal(result.answer, '<p>参考答案</p>')
  })
})
