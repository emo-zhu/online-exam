import { paperRepository } from './paper.repository.js'
import { AppError } from '../../common/errors/appError.js'
import { ERROR_CODES } from '../../common/constants/errorCodes.js'
import { parsePagination, buildPageResult } from '../../common/utils/pagination.js'
import { toBigIntId, toNullableBigIntId } from '../../common/utils/ids.js'
import { formatDateTime } from '../../common/utils/datetime.js'
import {
  sanitizeOptionalRichText,
  sanitizeRequiredRichText
} from '../../common/utils/richText.js'
import { subjectService } from '../subject/subject.service.js'

const subjectiveQuestionTypes = new Set(['text', 'fill', 'application'])

const normalizeOptions = (type, value) => {
  if (subjectiveQuestionTypes.has(type)) {
    return null
  }

  const options = value || {}
  return {
    A: sanitizeRequiredRichText(options.A, '选项A'),
    B: sanitizeRequiredRichText(options.B, '选项B'),
    C: sanitizeRequiredRichText(options.C, '选项C'),
    D: sanitizeRequiredRichText(options.D, '选项D')
  }
}

const normalizeAnswer = (type, value) => {
  if (type === 'select') {
    return Array.isArray(value) ? value.map((item) => String(item)) : []
  }

  return sanitizeOptionalRichText(value)
}

const toDateOrNull = (value, fieldName = 'startTime') => {
  if (!value) {
    return null
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new AppError(`${fieldName} 非法`, {
      code: ERROR_CODES.VALIDATION_ERROR,
      status: 400
    })
  }

  return date
}

const buildEndTime = (startTime, duration) => {
  if (!startTime) {
    return null
  }

  return new Date(startTime.getTime() + duration * 60 * 1000)
}

const mapPaperQuestion = (item, subjectNameMap = new Map()) => ({
  id: item.id,
  questionId: item.questionId,
  sourceQuestionId: item.questionId,
  subject: item.subject,
  subjectName: subjectNameMap.get(item.subject) || item.subject,
  type: item.type,
  title: item.title,
  score: item.score,
  options: item.options || { A: '', B: '', C: '', D: '' },
  answer: item.type === 'select' ? '' : (typeof item.answer === 'string' ? item.answer : ''),
  answers: item.type === 'select' && Array.isArray(item.answer) ? item.answer : [],
  analysis: item.analysis || ''
})

const mapPaperClass = (item) => ({
  id: item.class.id,
  classId: item.class.id,
  className: item.class.className,
  classCode: item.class.classCode
})

const mapPaper = (item, subjectNameMap = new Map()) => {
  const classList = (item.paperTargetClasses || []).map(mapPaperClass)

  return {
    id: item.id,
    paperName: item.paperName,
    subject: item.subject,
    subjectName: subjectNameMap.get(item.subject) || item.subject,
    totalScore: item.totalScore,
    duration: item.duration,
    startTime: formatDateTime(item.startTime),
    endTime: formatDateTime(item.endTime),
    createTime: formatDateTime(item.createdAt),
    status: item.status,
    allClasses: classList.length === 0,
    classIds: classList.map((classItem) => classItem.id),
    classList,
    questionCount: item.paperQuestions?.length ?? item._count?.paperQuestions ?? 0,
    recordCount: item._count?.examRecords ?? 0,
    questionList: item.paperQuestions ? item.paperQuestions.map((paperQuestion) => mapPaperQuestion(paperQuestion, subjectNameMap)) : []
  }
}

const buildQuestionSnapshots = async (paperSubject, questionList = []) => {
  return Promise.all(questionList.map(async (item, index) => {
    const questionId = toNullableBigIntId(item.questionId, 'questionId')
    const sourceQuestion = questionId ? await paperRepository.findQuestionById(questionId) : null

    if (questionId && !sourceQuestion) {
      throw new AppError('关联试题不存在', {
        code: ERROR_CODES.NOT_FOUND,
        status: 404
      })
    }

    const subject = item.subject || sourceQuestion?.subject || paperSubject
    if (subject !== paperSubject) {
      throw new AppError('试卷科目与试题科目不一致', {
        code: ERROR_CODES.VALIDATION_ERROR,
        status: 400
      })
    }

    const type = item.type || sourceQuestion?.type
    const title = sanitizeRequiredRichText(item.title ?? sourceQuestion?.title, '试题题干')

    const score = Number(item.score ?? sourceQuestion?.score ?? 0)
    if (!Number.isInteger(score) || score < 1) {
      throw new AppError('试题分值非法', {
        code: ERROR_CODES.VALIDATION_ERROR,
        status: 400
      })
    }

    return {
      questionId,
      subject,
      type,
      title,
      options: normalizeOptions(type, item.options ?? sourceQuestion?.options),
      answer: normalizeAnswer(type, item.answer ?? item.answers ?? sourceQuestion?.answer),
      analysis: sanitizeOptionalRichText(item.analysis ?? sourceQuestion?.analysis),
      sortOrder: index + 1,
      score
    }
  }))
}

const buildPaperTargetClasses = async (values = []) => {
  const classIds = []
  const seen = new Set()

  values.forEach((value, index) => {
    const classId = toBigIntId(value, `classIds[${index}]`)
    const key = classId.toString()
    if (seen.has(key)) {
      return
    }
    seen.add(key)
    classIds.push(classId)
  })

  if (classIds.length === 0) {
    return []
  }

  const classList = await paperRepository.findClassesByIds(classIds)
  if (classList.length !== classIds.length) {
    throw new AppError('适用班级不存在', {
      code: ERROR_CODES.VALIDATION_ERROR,
      status: 400
    })
  }

  return classIds.map((classId) => ({ classId }))
}

const buildPaperBaseData = async (payload) => {
  await subjectService.ensureSubjectExists(payload.subject)
  const questionList = await buildQuestionSnapshots(payload.subject, payload.questionList)
  const totalScore = questionList.reduce((sum, item) => sum + item.score, 0)
  const startTime = toDateOrNull(payload.startTime)
  const targetClassRows = await buildPaperTargetClasses(payload.classIds)

  return {
    paperName: payload.paperName,
    subject: payload.subject,
    totalScore,
    duration: payload.duration,
    startTime,
    endTime: buildEndTime(startTime, payload.duration),
    status: payload.status,
    questionList,
    targetClassRows
  }
}

const ensureEditable = async (paper) => {
  if (!paper) {
    throw new AppError('试卷不存在', {
      code: ERROR_CODES.NOT_FOUND,
      status: 404
    })
  }

  if ((paper._count?.examRecords || 0) > 0) {
    throw new AppError('试卷已有考试记录，暂不支持修改', {
      code: ERROR_CODES.CONFLICT,
      status: 409
    })
  }
}

const ensureDeletable = async (paper) => {
  if (!paper) {
    throw new AppError('试卷不存在', {
      code: ERROR_CODES.NOT_FOUND,
      status: 404
    })
  }

  const submittedCount = await paperRepository.countSubmittedExamRecordsByPaper(paper.id)
  if (submittedCount > 0) {
    throw new AppError('试卷已有已提交考试记录，暂不支持删除', {
      code: ERROR_CODES.CONFLICT,
      status: 409
    })
  }
}

export const paperService = {
  async listPapers(query) {
    const { pageNum, pageSize, skip, take } = parsePagination(query)
    const where = {}

    if (query.paperName) {
      where.paperName = { contains: query.paperName }
    }

    if (query.subject) {
      where.subject = query.subject
    }

    if (query.status !== undefined) {
      where.status = Number(query.status)
    }

    const [total, list] = await Promise.all([
      paperRepository.countPapers(where),
      paperRepository.findPapers({ where, skip, take })
    ])
    const subjectCodes = list.flatMap((item) => [
      item.subject,
      ...(item.paperQuestions || []).map((paperQuestion) => paperQuestion.subject)
    ])
    const subjectNameMap = await subjectService.getSubjectNameMap(subjectCodes)

    return buildPageResult({
      list: list.map((item) => mapPaper(item, subjectNameMap)),
      total,
      pageNum,
      pageSize
    })
  },

  async getPaperDetail(idValue) {
    const id = toBigIntId(idValue)
    const paper = await paperRepository.findPaperById(id)
    if (!paper) {
      throw new AppError('试卷不存在', {
        code: ERROR_CODES.NOT_FOUND,
        status: 404
      })
    }

    const subjectCodes = [
      paper.subject,
      ...(paper.paperQuestions || []).map((item) => item.subject)
    ]
    const subjectNameMap = await subjectService.getSubjectNameMap(subjectCodes)

    return mapPaper(paper, subjectNameMap)
  },

  async createPaper(payload, currentUser) {
    const { questionList, targetClassRows, ...paperData } = await buildPaperBaseData(payload)

    const created = await paperRepository.createPaper({
      ...paperData,
      creatorId: currentUser.id,
      paperQuestions: {
        create: questionList
      },
      ...(targetClassRows.length > 0
        ? {
            paperTargetClasses: {
              create: targetClassRows
            }
          }
        : {})
    })

    return this.getPaperDetail(created.id)
  },

  async updatePaper(idValue, payload) {
    const id = toBigIntId(idValue)
    const existing = await paperRepository.findPaperById(id)
    await ensureEditable(existing)

    const { questionList, targetClassRows, ...paperData } = await buildPaperBaseData(payload)

    await paperRepository.updatePaper(id, {
      ...paperData,
      paperQuestions: {
        deleteMany: {},
        ...(questionList.length > 0 ? { create: questionList } : {})
      },
      paperTargetClasses: {
        deleteMany: {},
        ...(targetClassRows.length > 0 ? { create: targetClassRows } : {})
      }
    })

    return this.getPaperDetail(id)
  },

  async updatePaperStatus(idValue, payload) {
    const id = toBigIntId(idValue)
    const existing = await paperRepository.findPaperById(id)
    if (!existing) {
      throw new AppError('试卷不存在', {
        code: ERROR_CODES.NOT_FOUND,
        status: 404
      })
    }

    if (payload.status === 1 && existing.paperQuestions.length === 0) {
      throw new AppError('试卷至少需要一道试题才能发布', {
        code: ERROR_CODES.VALIDATION_ERROR,
        status: 400
      })
    }

    let startTime = existing.startTime
    let endTime = existing.endTime

    if (payload.status === 1) {
      const now = new Date()
      if (!startTime || (endTime && endTime < now)) {
        startTime = now
        endTime = buildEndTime(now, existing.duration)
      }
    }

    await paperRepository.updatePaper(id, {
      status: payload.status,
      startTime,
      endTime
    })

    return this.getPaperDetail(id)
  },

  async deletePaper(idValue) {
    const id = toBigIntId(idValue)
    const existing = await paperRepository.findPaperById(id)
    await ensureDeletable(existing)
    await paperRepository.deletePaper(id)
  }
}
