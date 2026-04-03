import { AppError } from '../../common/errors/appError.js'
import { ERROR_CODES } from '../../common/constants/errorCodes.js'
import { parsePagination, buildPageResult } from '../../common/utils/pagination.js'
import { toBigIntId } from '../../common/utils/ids.js'
import { formatDateTime } from '../../common/utils/datetime.js'
import { examRecordRepository } from './examRecord.repository.js'
import { subjectService } from '../subject/subject.service.js'
import { createMonitorChangeEvent, monitorSseHub } from '../monitor/monitor.sse.js'

const subjectiveQuestionTypes = new Set(['text', 'fill', 'application'])

const getSubjectName = (subject, subjectNameMap = new Map()) => subjectNameMap.get(subject) || subject || ''

const sameId = (left, right) => {
  if (left === null || left === undefined || right === null || right === undefined) {
    return false
  }

  return left.toString() === right.toString()
}

const normalizeArrayAnswer = (value) => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((item) => String(item)).sort()
}

const normalizeTextAnswer = (value) => {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
}

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

const getStudentExamStatusText = (status) => {
  const map = {
    not_started: '未开始',
    ongoing: '进行中',
    ended: '已结束',
    submitted: '已交卷',
    marked: '已出分'
  }
  return map[status] || status
}

const getStudentExamActionText = (status) => {
  const map = {
    not_started: '未开始',
    ongoing: '进入考试',
    ended: '已结束',
    submitted: '已交卷',
    marked: '查看成绩'
  }
  return map[status] || '查看'
}

const getStudentExamTagType = (status) => {
  const map = {
    not_started: 'warning',
    ongoing: 'success',
    ended: 'info',
    submitted: 'info',
    marked: 'primary'
  }
  return map[status] || 'info'
}

const mapStudentExamItem = (paper, record, subjectNameMap = new Map()) => {
  let status = getPaperTimeStatus(paper)
  if (record?.status === 1) {
    status = 'submitted'
  }
  if (record?.status === 2) {
    status = 'marked'
  }

  const classIds = (paper.paperTargetClasses || []).map((item) => item.classId)

  return {
    id: paper.id,
    recordId: record?.id || null,
    title: paper.paperName,
    paperName: paper.paperName,
    subject: paper.subject,
    subjectName: getSubjectName(paper.subject, subjectNameMap),
    startTime: formatDateTime(paper.startTime),
    endTime: formatDateTime(paper.endTime),
    duration: paper.duration,
    totalScore: paper.totalScore,
    allClasses: classIds.length === 0,
    classIds,
    status,
    statusText: getStudentExamStatusText(status),
    statusTagType: getStudentExamTagType(status),
    actionText: getStudentExamActionText(status),
    submitTime: formatDateTime(record?.submitTime),
    score: record?.status === 2 ? record.totalScore : null
  }
}

const mapPaperQuestion = (item, subjectNameMap = new Map()) => ({
  id: item.id,
  questionId: item.questionId,
  type: item.type,
  subject: item.subject,
  subjectName: getSubjectName(item.subject, subjectNameMap),
  title: item.title,
  score: item.score,
  options: item.options || { A: '', B: '', C: '', D: '' },
  answer: '',
  answers: [],
  analysis: ''
})

const mapSavedAnswer = (item) => ({
  paperQuestionId: item.paperQuestionId,
  answer: item.paperQuestion?.type === 'select'
    ? normalizeArrayAnswer(item.answer)
    : normalizeTextAnswer(item.answer)
})

const getRecordDeadline = (paper, startedAt) => {
  if (paper.endTime) {
    return new Date(paper.endTime)
  }

  if (!startedAt) {
    return null
  }

  return new Date(new Date(startedAt).getTime() + Number(paper.duration || 0) * 60 * 1000)
}

const getRemainingSeconds = (paper, startedAt) => {
  const deadline = getRecordDeadline(paper, startedAt)
  if (!deadline || Number.isNaN(deadline.getTime())) {
    return Math.max(Number(paper.duration || 0) * 60, 0)
  }

  return Math.max(Math.floor((deadline.getTime() - Date.now()) / 1000), 0)
}

const mapStudentPaperDetail = (paper, record, subjectNameMap = new Map()) => ({
  id: paper.id,
  recordId: record?.id || null,
  paperName: paper.paperName,
  subject: paper.subject,
  subjectName: getSubjectName(paper.subject, subjectNameMap),
  duration: paper.duration,
  totalScore: paper.totalScore,
  startTime: formatDateTime(paper.startTime),
  endTime: formatDateTime(paper.endTime),
  startedAt: formatDateTime(record?.startedAt),
  remainingSeconds: record?.startedAt ? getRemainingSeconds(paper, record.startedAt) : Math.max(Number(paper.duration || 0) * 60, 0),
  cheatCount: Number(record?.cheatCount || 0),
  questionList: (paper.paperQuestions || []).map((item) => mapPaperQuestion(item, subjectNameMap)),
  savedAnswers: (record?.answers || []).map(mapSavedAnswer),
  submitTime: formatDateTime(record?.submitTime),
  status: record?.status ?? null
})

const mapStudentStartedExam = (paper, record, subjectNameMap = new Map()) => ({
  id: paper.id,
  recordId: record.id,
  paperName: paper.paperName,
  subject: paper.subject,
  subjectName: getSubjectName(paper.subject, subjectNameMap),
  duration: paper.duration,
  totalScore: paper.totalScore,
  startTime: formatDateTime(paper.startTime),
  endTime: formatDateTime(paper.endTime),
  startedAt: formatDateTime(record.startedAt),
  remainingSeconds: getRemainingSeconds(paper, record.startedAt),
  cheatCount: Number(record.cheatCount || 0),
  questionList: (paper.paperQuestions || []).map((item) => mapPaperQuestion(item, subjectNameMap)),
  savedAnswers: (record.answers || []).map(mapSavedAnswer),
  status: record.status
})

const mapStudentScoreItem = (record, subjectNameMap = new Map()) => ({
  id: record.id,
  examId: record.paperId,
  recordId: record.id,
  examName: record.examNameSnapshot,
  subject: record.subjectSnapshot,
  subjectName: getSubjectName(record.subjectSnapshot, subjectNameMap),
  score: record.totalScore,
  status: record.totalScore >= 60 ? 1 : 0,
  submitTime: formatDateTime(record.submitTime),
  className: record.classNameSnapshot,
  studentName: record.student?.realName || ''
})

const mapTeacherRecordItem = (record, subjectNameMap = new Map()) => ({
  id: record.id,
  recordId: record.id,
  examId: record.paperId,
  examName: record.examNameSnapshot,
  subject: record.subjectSnapshot,
  subjectName: getSubjectName(record.subjectSnapshot, subjectNameMap),
  studentName: record.student?.realName || '',
  className: record.classNameSnapshot,
  score: record.totalScore,
  status: record.status,
  submitTime: formatDateTime(record.submitTime),
  markedAt: formatDateTime(record.markedAt)
})

const mapMarkAnswer = (item) => ({
  id: item.id,
  answerId: item.id,
  paperQuestionId: item.paperQuestionId,
  questionId: item.questionId,
  type: item.paperQuestion.type,
  title: item.paperQuestion.title,
  score: item.score,
  maxScore: item.paperQuestion.score,
  comment: item.comment || '',
  myAnswer: item.answer,
  correctAnswer: item.paperQuestion.answer,
  analysis: item.paperQuestion.analysis || '',
  options: item.paperQuestion.options || null
})

const mapWrongBookItem = (item, subjectNameMap = new Map()) => ({
  id: item.id,
  recordId: item.recordId,
  examId: item.record?.paperId || null,
  examName: item.record?.examNameSnapshot || '',
  subject: item.paperQuestion?.subject || '',
  subjectName: getSubjectName(item.paperQuestion?.subject, subjectNameMap),
  title: item.paperQuestion?.title || '',
  type: item.paperQuestion?.type || '',
  score: item.paperQuestion?.score || 0,
  options: item.paperQuestion?.options || null,
  answer: item.correctAnswer,
  myAnswer: item.myAnswer,
  analysis: item.paperQuestion?.analysis || '',
  createTime: formatDateTime(item.createdAt)
})

const ensureStudentCanAccessPaper = (paper, currentUser) => {
  if (!paper || paper.status !== 1) {
    throw new AppError('考试不存在或未发布', { code: ERROR_CODES.NOT_FOUND, status: 404 })
  }

  if (currentUser.roles?.includes('admin')) {
    return
  }

  const targetClasses = paper.paperTargetClasses || []
  if (targetClasses.length === 0) {
    return
  }

  if (!currentUser.classId) {
    throw new AppError('当前用户未分配班级，无法参加该考试', { code: ERROR_CODES.FORBIDDEN, status: 403 })
  }

  const currentClassId = toBigIntId(currentUser.classId, 'classId')
  const matched = targetClasses.some((item) => item.classId.toString() === currentClassId.toString())
  if (!matched) {
    throw new AppError('当前考试不在你的适用班级范围内', { code: ERROR_CODES.FORBIDDEN, status: 403 })
  }
}

const ensureStudentExamContinuable = (paper, record) => {
  if (!paper || paper.status !== 1) {
    throw new AppError('考试不存在或未发布', { code: ERROR_CODES.NOT_FOUND, status: 404 })
  }

  if (record?.status === 1 || record?.status === 2) {
    throw new AppError('该考试已交卷', { code: ERROR_CODES.CONFLICT, status: 409 })
  }

  const timeStatus = getPaperTimeStatus(paper)
  if (timeStatus === 'not_started') {
    throw new AppError('考试未开始', { code: ERROR_CODES.CONFLICT, status: 409 })
  }

  if (timeStatus === 'ended' && !record?.startedAt) {
    throw new AppError('考试已结束', { code: ERROR_CODES.CONFLICT, status: 409 })
  }
}

const buildDraftAnswerRows = (paperQuestions, answerMap) => {
  return paperQuestions
    .map((question) => {
      const answer = question.type === 'select'
        ? normalizeArrayAnswer(answerMap.get(question.id))
        : normalizeTextAnswer(answerMap.get(question.id))

      const answered = Array.isArray(answer) ? answer.length > 0 : answer !== ''
      if (!answered) {
        return null
      }

      return {
        paperQuestionId: question.id,
        questionId: question.questionId,
        answer
      }
    })
    .filter(Boolean)
}

const buildObjectiveAnswerRows = (paperQuestions, answerMap) => {
  let objectiveScore = 0
  let subjectiveScore = 0

  const answerRows = paperQuestions.map((question) => {
    const rawAnswer = answerMap.get(question.id)

    if (question.type === 'select') {
      const studentAnswer = normalizeArrayAnswer(rawAnswer)
      const correctAnswer = normalizeArrayAnswer(question.answer)
      const isCorrect = JSON.stringify(studentAnswer) === JSON.stringify(correctAnswer)
      const score = isCorrect ? question.score : 0
      objectiveScore += score
      return {
        paperQuestionId: question.id,
        questionId: question.questionId,
        answer: studentAnswer,
        isCorrect: isCorrect ? 1 : 0,
        score,
        comment: null,
        type: question.type,
        correctAnswer,
        myAnswer: studentAnswer
      }
    }

    if (subjectiveQuestionTypes.has(question.type)) {
      const studentAnswer = normalizeTextAnswer(rawAnswer)
      return {
        paperQuestionId: question.id,
        questionId: question.questionId,
        answer: studentAnswer,
        isCorrect: studentAnswer ? 1 : 0,
        score: 0,
        comment: null,
        type: question.type,
        correctAnswer: normalizeTextAnswer(question.answer),
        myAnswer: studentAnswer,
        maxScore: question.score,
        pendingMark: true
      }
    }

    const studentAnswer = normalizeTextAnswer(rawAnswer)
    const correctAnswer = normalizeTextAnswer(question.answer)
    const isCorrect = studentAnswer === correctAnswer && studentAnswer !== ''
    const score = isCorrect ? question.score : 0
    objectiveScore += score
    return {
      paperQuestionId: question.id,
      questionId: question.questionId,
      answer: studentAnswer,
      isCorrect: isCorrect ? 1 : 0,
      score,
      comment: null,
      type: question.type,
      correctAnswer,
      myAnswer: studentAnswer
    }
  })

  const hasPendingMark = answerRows.some((item) => item.pendingMark)
  if (!hasPendingMark) {
    subjectiveScore = 0
  }

  return {
    answerRows,
    objectiveScore,
    subjectiveScore,
    status: hasPendingMark ? 1 : 2
  }
}

export const examRecordService = {
  async listStudentExams(currentUser) {
    const papers = currentUser.roles?.includes('admin')
      ? await examRecordRepository.findPublishedPapersForAdmin(currentUser.id)
      : await examRecordRepository.findPublishedPapersByStudent(currentUser.id, currentUser.classId)
    const subjectNameMap = await subjectService.getSubjectNameMap(papers.map((paper) => paper.subject))

    return papers.map((paper) => mapStudentExamItem(paper, paper.examRecords?.[0], subjectNameMap))
  },

  async getStudentExamDetail(paperIdValue, currentUser) {
    const paperId = toBigIntId(paperIdValue, 'paperId')
    const paper = await examRecordRepository.findPaperById(paperId)
    ensureStudentCanAccessPaper(paper, currentUser)
    const record = await examRecordRepository.findRecordByPaperAndStudent(paperId, currentUser.id)
    ensureStudentExamContinuable(paper, record)
    const subjectNameMap = await subjectService.getSubjectNameMap((paper.paperQuestions || []).map((item) => item.subject).concat(paper.subject))
    return mapStudentPaperDetail(paper, record, subjectNameMap)
  },

  async startStudentExam(paperIdValue, currentUser) {
    const paperId = toBigIntId(paperIdValue, 'paperId')
    const paper = await examRecordRepository.findPaperById(paperId)
    ensureStudentCanAccessPaper(paper, currentUser)
    const existingRecord = await examRecordRepository.findRecordByPaperAndStudent(paperId, currentUser.id)
    ensureStudentExamContinuable(paper, existingRecord)

    const student = await examRecordRepository.findStudentById(currentUser.id)
    if (!student) {
      throw new AppError('用户不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    const startedAt = existingRecord?.startedAt || new Date()
    const record = existingRecord
      ? (existingRecord.startedAt ? existingRecord : await examRecordRepository.updateRecordStartedAt(existingRecord.id, startedAt))
      : await examRecordRepository.createStartedRecord({ paper, student, startedAt })

    if (getRemainingSeconds(paper, record.startedAt) <= 0) {
      throw new AppError('考试已结束', { code: ERROR_CODES.CONFLICT, status: 409 })
    }

    const subjectNameMap = await subjectService.getSubjectNameMap((paper.paperQuestions || []).map((item) => item.subject).concat(paper.subject))
    return mapStudentStartedExam(paper, record, subjectNameMap)
  },

  async submitStudentExam(paperIdValue, payload, currentUser) {
    const paperId = toBigIntId(paperIdValue, 'paperId')
    const paper = await examRecordRepository.findPaperById(paperId)
    ensureStudentCanAccessPaper(paper, currentUser)
    const existingRecord = await examRecordRepository.findRecordByPaperAndStudent(paperId, currentUser.id)
    ensureStudentExamContinuable(paper, existingRecord)

    const student = await examRecordRepository.findStudentById(currentUser.id)
    if (!student) {
      throw new AppError('用户不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    const startedAt = existingRecord?.startedAt || new Date()
    const payloadAnswers = Array.isArray(payload.answers) && payload.answers.length > 0
      ? payload.answers
      : (existingRecord?.answers || []).map((item) => ({
          paperQuestionId: item.paperQuestionId,
          answer: item.answer
        }))
    const answerMap = new Map(payloadAnswers.map((item) => [toBigIntId(item.paperQuestionId, 'paperQuestionId'), item.answer]))
    const { answerRows, objectiveScore, subjectiveScore, status } = buildObjectiveAnswerRows(paper.paperQuestions || [], answerMap)
    const totalScore = objectiveScore + subjectiveScore
    const submitTime = new Date()

    const wrongBookRows = answerRows
      .filter((item) => !subjectiveQuestionTypes.has(item.type) && item.isCorrect !== 1)
      .map((item) => ({
        paperQuestionId: item.paperQuestionId,
        questionId: item.questionId,
        myAnswer: item.myAnswer,
        correctAnswer: item.correctAnswer
      }))

    const savedRecord = await examRecordRepository.saveSubmittedRecord({
      existingRecordId: existingRecord?.id || null,
      paper,
      student,
      startedAt,
      status,
      objectiveScore,
      subjectiveScore,
      totalScore,
      submitTime,
      forcedSubmit: payload.forcedSubmit || 0,
      cheatCount: payload.cheatCount || 0,
      answerRows,
      wrongBookRows
    })

    if (!payload.forcedSubmit) {
      monitorSseHub.broadcastChange(createMonitorChangeEvent('student_submit', {
        paperId: savedRecord.paperId,
        studentId: savedRecord.studentId
      }))
    }

    return {
      recordId: savedRecord.id,
      paperId: savedRecord.paperId,
      examName: savedRecord.examNameSnapshot,
      subject: savedRecord.subjectSnapshot,
      subjectName: getSubjectName(savedRecord.subjectSnapshot, await subjectService.getSubjectNameMap([savedRecord.subjectSnapshot])),
      score: savedRecord.totalScore,
      objectiveScore: savedRecord.objectiveScore,
      subjectiveScore: savedRecord.subjectiveScore,
      status: savedRecord.status,
      submitTime: formatDateTime(savedRecord.submitTime)
    }
  },

  async autosaveStudentExam(recordIdValue, payload, currentUser) {
    const recordId = toBigIntId(recordIdValue, 'recordId')
    const record = await examRecordRepository.findRecordById(recordId)
    if (!record || !sameId(record.studentId, currentUser.id)) {
      throw new AppError('考试记录不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    if (record.status === 1 || record.status === 2) {
      throw new AppError('该考试已交卷，无法继续保存', { code: ERROR_CODES.CONFLICT, status: 409 })
    }

    ensureStudentCanAccessPaper(record.paper, currentUser)
    ensureStudentExamContinuable(record.paper, record)

    const answerMap = new Map((payload.answers || []).map((item) => [toBigIntId(item.paperQuestionId, 'paperQuestionId'), item.answer]))
    const answerRows = buildDraftAnswerRows(record.paper.paperQuestions || [], answerMap)
    const savedRecord = await examRecordRepository.autosaveRecord({
      recordId,
      cheatCount: payload.cheatCount || 0,
      answerRows
    })

    return {
      recordId: savedRecord.id,
      startedAt: formatDateTime(savedRecord.startedAt),
      savedAt: formatDateTime(savedRecord.updatedAt),
      cheatCount: Number(savedRecord.cheatCount || 0),
      savedAnswerCount: savedRecord.answers.length,
      remainingSeconds: getRemainingSeconds(savedRecord.paper, savedRecord.startedAt)
    }
  },

  async listStudentScores(currentUser) {
    const list = await examRecordRepository.findStudentSubmittedRecords(currentUser.id)
    const subjectNameMap = await subjectService.getSubjectNameMap(list.map((item) => item.subjectSnapshot))
    return list.map((item) => mapStudentScoreItem(item, subjectNameMap))
  },

  async getStudentAnalysis(recordIdValue, currentUser) {
    const recordId = toBigIntId(recordIdValue)
    const record = await examRecordRepository.findRecordById(recordId)
    if (!record || !sameId(record.studentId, currentUser.id)) {
      throw new AppError('成绩记录不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }
    const subjectNameMap = await subjectService.getSubjectNameMap([record.subjectSnapshot])

    return {
      recordId: record.id,
      examId: record.paperId,
      examTitle: record.examNameSnapshot,
      subject: record.subjectSnapshot,
      subjectName: getSubjectName(record.subjectSnapshot, subjectNameMap),
      studentName: record.student?.realName || '',
      totalScore: record.totalScore,
      fullScore: record.paper?.totalScore || 0,
      submitTime: formatDateTime(record.submitTime),
      questions: record.answers.map((item) => ({
        id: item.paperQuestionId,
        type: item.paperQuestion.type,
        title: item.paperQuestion.title,
        score: item.paperQuestion.score,
        options: item.paperQuestion.options || null,
        analysis: item.paperQuestion.analysis || '',
        myAnswer: item.answer,
        answer: item.paperQuestion.type === 'select' ? [] : item.paperQuestion.answer,
        answers: item.paperQuestion.type === 'select' && Array.isArray(item.paperQuestion.answer) ? item.paperQuestion.answer : [],
        isCorrect: item.isCorrect,
        obtainedScore: item.score,
        comment: item.comment || ''
      }))
    }
  },

  async listTeacherRecords(query) {
    const { pageNum, pageSize, skip, take } = parsePagination(query)
    const where = {
      submitTime: { not: null }
    }

    if (query.paperId) {
      where.paperId = toBigIntId(query.paperId, 'paperId')
    }

    if (query.examName) {
      where.examNameSnapshot = { contains: query.examName }
    }

    if (query.subject) {
      where.subjectSnapshot = query.subject
    }

    if (query.status !== undefined) {
      where.status = Number(query.status)
    }

    if (query.className) {
      where.classNameSnapshot = { contains: query.className }
    }

    if (query.studentName) {
      where.student = {
        realName: { contains: query.studentName }
      }
    }

    const [total, list] = await Promise.all([
      examRecordRepository.countRecords(where),
      examRecordRepository.findRecords({ where, skip, take })
    ])
    const subjectNameMap = await subjectService.getSubjectNameMap(list.map((item) => item.subjectSnapshot))

    return buildPageResult({
      list: list.map((item) => mapTeacherRecordItem(item, subjectNameMap)),
      total,
      pageNum,
      pageSize
    })
  },

  async getTeacherMarkDetail(recordIdValue) {
    const recordId = toBigIntId(recordIdValue)
    const record = await examRecordRepository.findRecordById(recordId)
    if (!record) {
      throw new AppError('阅卷记录不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }
    const subjectNameMap = await subjectService.getSubjectNameMap([record.subjectSnapshot])

    return {
      recordId: record.id,
      examId: record.paperId,
      examName: record.examNameSnapshot,
      subject: record.subjectSnapshot,
      subjectName: getSubjectName(record.subjectSnapshot, subjectNameMap),
      studentName: record.student?.realName || '',
      className: record.classNameSnapshot,
      objectiveScore: record.objectiveScore,
      subjectiveScore: record.subjectiveScore,
      totalScore: record.totalScore,
      status: record.status,
      submitTime: formatDateTime(record.submitTime),
      answers: record.answers.map(mapMarkAnswer)
    }
  },

  async submitTeacherMark(recordIdValue, payload, currentUser) {
    const recordId = toBigIntId(recordIdValue)
    const record = await examRecordRepository.findRecordById(recordId)
    if (!record) {
      throw new AppError('阅卷记录不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    const markMap = new Map(payload.answers.map((item) => [toBigIntId(item.answerId, 'answerId'), item]))
    const answerMarks = []
    let subjectiveScore = 0

    for (const item of record.answers) {
      if (!subjectiveQuestionTypes.has(item.paperQuestion.type)) {
        continue
      }

      const markItem = markMap.get(item.id)
      if (!markItem) {
        throw new AppError('存在未评分的主观题', { code: ERROR_CODES.VALIDATION_ERROR, status: 400 })
      }

      if (markItem.score > item.paperQuestion.score) {
        throw new AppError('评分不能超过题目分值', { code: ERROR_CODES.VALIDATION_ERROR, status: 400 })
      }

      const isCorrect = markItem.score >= item.paperQuestion.score ? 1 : (markItem.score > 0 ? 1 : 0)
      subjectiveScore += markItem.score
      answerMarks.push({
        answerId: item.id,
        score: markItem.score,
        comment: markItem.comment || null,
        isCorrect
      })
    }

    const totalScore = record.objectiveScore + subjectiveScore
    const wrongBookRows = record.answers
      .filter((item) => subjectiveQuestionTypes.has(item.paperQuestion.type))
      .map((item) => {
        const markItem = markMap.get(item.id)
        if (!markItem || markItem.score > 0) {
          return null
        }

        return {
          studentId: record.studentId,
          recordId: record.id,
          paperQuestionId: item.paperQuestionId,
          questionId: item.questionId,
          myAnswer: item.answer,
          correctAnswer: item.paperQuestion.answer
        }
      })
      .filter(Boolean)

    const savedRecord = await examRecordRepository.submitTeacherMark({
      recordId,
      totalScore,
      subjectiveScore,
      answerMarks,
      wrongBookRows,
      textQuestionIds: record.answers
        .filter((item) => subjectiveQuestionTypes.has(item.paperQuestion.type))
        .map((item) => item.paperQuestionId),
      operatorId: currentUser.id
    })

    return {
      recordId: savedRecord.id,
      totalScore: savedRecord.totalScore,
      subjectiveScore: savedRecord.subjectiveScore,
      markedAt: formatDateTime(savedRecord.markedAt),
      status: savedRecord.status
    }
  },

  async listWrongBooks(currentUser) {
    const list = await examRecordRepository.findWrongBooksByStudent(currentUser.id)
    const subjectNameMap = await subjectService.getSubjectNameMap(list.map((item) => item.paperQuestion?.subject).filter(Boolean))
    return list.map((item) => mapWrongBookItem(item, subjectNameMap))
  },

  async removeWrongBook(idValue, currentUser) {
    const id = toBigIntId(idValue)
    const item = await examRecordRepository.findWrongBookById(id)
    if (!item || !sameId(item.studentId, currentUser.id)) {
      throw new AppError('错题不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    await examRecordRepository.deleteWrongBook(id)
  }
}
