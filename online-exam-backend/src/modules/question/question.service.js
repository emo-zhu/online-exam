import { questionRepository } from './question.repository.js'
import { AppError } from '../../common/errors/appError.js'
import { ERROR_CODES } from '../../common/constants/errorCodes.js'
import { parsePagination, buildPageResult } from '../../common/utils/pagination.js'
import { toBigIntId, toNullableBigIntId } from '../../common/utils/ids.js'
import { randomString } from '../../common/utils/random.js'
import {
  sanitizeOptionalRichText,
  sanitizeRequiredRichText,
  stripRichText
} from '../../common/utils/richText.js'
import { subjectService } from '../subject/subject.service.js'
import { mkdir, copyFile, unlink, readFile } from 'node:fs/promises'
import path from 'node:path'

const typeNameMap = {
  judge: '单选题',
  select: '多选题',
  text: '简答题',
  fill: '填空题',
  application: '应用题'
}

const subjectiveQuestionTypes = new Set(['text', 'fill', 'application'])

const uploadRootDir = path.resolve(process.cwd(), 'uploads', 'question-content')
const allowedImageMimeSet = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'])
const extensionByImageMime = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp'
}
const imageMimeByExtension = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp'
}
const maxUploadSize = 5 * 1024 * 1024

const normalizeQuestionAnswer = (payload) => {
  if (payload.type === 'select') {
    return Array.isArray(payload.answer) ? payload.answer.map((item) => String(item)) : []
  }

  return sanitizeOptionalRichText(payload.answer)
}

const normalizeOptions = (payload) => {
  if (subjectiveQuestionTypes.has(payload.type)) {
    return null
  }

  const options = payload.options || {}
  return {
    A: sanitizeRequiredRichText(options.A, '选项A'),
    B: sanitizeRequiredRichText(options.B, '选项B'),
    C: sanitizeRequiredRichText(options.C, '选项C'),
    D: sanitizeRequiredRichText(options.D, '选项D')
  }
}

const mapQuestion = (item, subjectNameMap = new Map()) => ({
  id: item.id,
  subject: item.subject,
  subjectName: subjectNameMap.get(item.subject) || item.subject,
  categoryId: item.categoryId,
  categoryName: item.category?.name || '',
  type: item.type,
  typeName: typeNameMap[item.type] || item.type,
  title: item.title,
  titleText: stripRichText(item.title),
  score: item.score,
  options: item.options || { A: '', B: '', C: '', D: '' },
  optionTexts: item.options
    ? Object.fromEntries(Object.entries(item.options).map(([key, value]) => [key, stripRichText(value)]))
    : { A: '', B: '', C: '', D: '' },
  answer: item.type === 'select' ? '' : (typeof item.answer === 'string' ? item.answer : ''),
  answerText: item.type === 'select' ? '' : stripRichText(typeof item.answer === 'string' ? item.answer : ''),
  answers: item.type === 'select' && Array.isArray(item.answer) ? item.answer : [],
  analysis: item.analysis || '',
  analysisText: stripRichText(item.analysis || '')
})

const ensureCategory = async (subject, categoryId) => {
  if (!categoryId) {
    return null
  }

  const category = await questionRepository.findCategoryById(categoryId)
  if (!category) {
    throw new AppError('分类不存在', { code: ERROR_CODES.VALIDATION_ERROR, status: 400 })
  }

  if (category.subject !== subject) {
    throw new AppError('题目科目与分类科目不一致', { code: ERROR_CODES.VALIDATION_ERROR, status: 400 })
  }

  return category
}

const getUploadExtension = (file) => {
  const detectedExt = extensionByImageMime[file.mimetype || '']
  if (detectedExt) {
    return detectedExt
  }

  const originalName = file.originalFilename || file.newFilename || ''
  const ext = path.extname(originalName).toLowerCase()
  return imageMimeByExtension[ext] ? ext : '.png'
}

const buildUploadUrl = (filename) => `/api/v1/questions/content-images/${filename}`

const getUploadFile = (file) => Array.isArray(file) ? file[0] : file
const getUploadFilePath = (filename) => path.join(uploadRootDir, path.basename(filename))

export const questionService = {
  async listQuestions(query) {
    const { pageNum, pageSize, skip, take } = parsePagination(query)
    const where = {}

    if (query.title) {
      where.title = { contains: query.title }
    }

    if (query.subject) {
      where.subject = query.subject
    }

    if (query.type) {
      where.type = query.type
    }

    if (query.categoryId) {
      where.categoryId = toBigIntId(query.categoryId, 'categoryId')
    }

    const [total, list] = await Promise.all([
      questionRepository.countQuestions(where),
      questionRepository.findQuestions({ where, skip, take })
    ])
    const subjectNameMap = await subjectService.getSubjectNameMap(list.map((item) => item.subject))

    return buildPageResult({
      list: list.map((item) => mapQuestion(item, subjectNameMap)),
      total,
      pageNum,
      pageSize
    })
  },

  async createQuestion(payload) {
    await subjectService.ensureSubjectExists(payload.subject)
    const categoryId = toNullableBigIntId(payload.categoryId, 'categoryId')
    await ensureCategory(payload.subject, categoryId)

    const question = await questionRepository.createQuestion({
      subject: payload.subject,
      categoryId,
      type: payload.type,
      title: sanitizeRequiredRichText(payload.title, '题干'),
      score: payload.score,
      options: normalizeOptions(payload),
      answer: normalizeQuestionAnswer(payload),
      analysis: sanitizeOptionalRichText(payload.analysis),
      status: 1
    })
    const subjectNameMap = await subjectService.getSubjectNameMap([question.subject])

    return mapQuestion(question, subjectNameMap)
  },

  async updateQuestion(idValue, payload) {
    const id = toBigIntId(idValue)
    const existing = await questionRepository.findQuestionById(id)
    if (!existing) {
      throw new AppError('试题不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    await subjectService.ensureSubjectExists(payload.subject)
    const categoryId = toNullableBigIntId(payload.categoryId, 'categoryId')
    await ensureCategory(payload.subject, categoryId)

    const question = await questionRepository.updateQuestion(id, {
      subject: payload.subject,
      categoryId,
      type: payload.type,
      title: sanitizeRequiredRichText(payload.title, '题干'),
      score: payload.score,
      options: normalizeOptions(payload),
      answer: normalizeQuestionAnswer(payload),
      analysis: sanitizeOptionalRichText(payload.analysis)
    })
    const subjectNameMap = await subjectService.getSubjectNameMap([question.subject])

    return mapQuestion(question, subjectNameMap)
  },

  async batchDeleteQuestions(payload) {
    const ids = [...new Set(payload.ids.map((item) => toBigIntId(item, 'id').toString()))].map((idString) => BigInt(idString))

    for (const id of ids) {
      const existing = await questionRepository.findQuestionById(id)
      if (!existing) {
        throw new AppError('试题不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
      }
    }

    for (const id of ids) {
      await questionRepository.deleteQuestion(id)
    }

    return {
      deletedCount: ids.length
    }
  },

  async deleteQuestion(idValue) {
    const id = toBigIntId(idValue)
    const existing = await questionRepository.findQuestionById(id)
    if (!existing) {
      throw new AppError('试题不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    await questionRepository.deleteQuestion(id)
  },

  async uploadContentImage(file) {
    const uploadFile = getUploadFile(file)
    if (!uploadFile?.filepath) {
      throw new AppError('请上传图片文件', { code: ERROR_CODES.VALIDATION_ERROR, status: 400 })
    }

    if (!allowedImageMimeSet.has(uploadFile.mimetype || '')) {
      await unlink(uploadFile.filepath).catch(() => {})
      throw new AppError('仅支持 png、jpg、jpeg、gif、webp 图片', { code: ERROR_CODES.VALIDATION_ERROR, status: 400 })
    }

    if (Number(uploadFile.size || 0) > maxUploadSize) {
      await unlink(uploadFile.filepath).catch(() => {})
      throw new AppError('图片大小不能超过 5MB', { code: ERROR_CODES.VALIDATION_ERROR, status: 400 })
    }

    await mkdir(uploadRootDir, { recursive: true })
    const filename = `${Date.now()}-${randomString(10)}${getUploadExtension(uploadFile)}`
    const targetPath = path.join(uploadRootDir, filename)
    await copyFile(uploadFile.filepath, targetPath)
    await unlink(uploadFile.filepath).catch(() => {})

    return {
      url: buildUploadUrl(filename),
      filename,
      originalName: uploadFile.originalFilename || filename,
      size: Number(uploadFile.size || 0)
    }
  },

  async getContentImage(filename) {
    const safeFilename = path.basename(filename || '')
    if (!safeFilename) {
      throw new AppError('图片不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    const filePath = getUploadFilePath(safeFilename)
    let buffer
    try {
      buffer = await readFile(filePath)
    } catch {
      throw new AppError('图片不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    const ext = path.extname(safeFilename).toLowerCase()
    return {
      filename: safeFilename,
      buffer,
      contentType: imageMimeByExtension[ext] || 'application/octet-stream'
    }
  }
}
