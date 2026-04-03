import { AppError } from '../../common/errors/appError.js'
import { ERROR_CODES } from '../../common/constants/errorCodes.js'
import { toBigIntId } from '../../common/utils/ids.js'
import { subjectRepository } from './subject.repository.js'

const mapSubject = (item) => ({
  id: item.id,
  subjectCode: item.subjectCode,
  subjectName: item.subjectName,
  code: item.subjectCode,
  name: item.subjectName,
  sortOrder: item.sortOrder
})

const buildListWhere = (query = {}) => {
  const keyword = query.keyword?.trim()
  if (!keyword) {
    return {}
  }

  return {
    OR: [
      { subjectCode: { contains: keyword } },
      { subjectName: { contains: keyword } }
    ]
  }
}

const ensureUniqueSubject = async (payload, currentId = null) => {
  const [sameCode, sameName] = await Promise.all([
    subjectRepository.findSubjectByCode(payload.subjectCode),
    subjectRepository.findSubjectByName(payload.subjectName)
  ])

  if (sameCode && sameCode.id !== currentId) {
    throw new AppError('学科编码已存在', { code: ERROR_CODES.CONFLICT, status: 409 })
  }

  if (sameName && sameName.id !== currentId) {
    throw new AppError('学科名称已存在', { code: ERROR_CODES.CONFLICT, status: 409 })
  }
}

const countSubjectUsage = async (subjectCode) => {
  const [categoryCount, questionCount, paperCount, recordCount] = await Promise.all([
    subjectRepository.countQuestionCategoriesBySubject(subjectCode),
    subjectRepository.countQuestionsBySubject(subjectCode),
    subjectRepository.countPapersBySubject(subjectCode),
    subjectRepository.countExamRecordsBySubject(subjectCode)
  ])

  return {
    categoryCount,
    questionCount,
    paperCount,
    recordCount,
    total: categoryCount + questionCount + paperCount + recordCount
  }
}

export const subjectService = {
  async listSubjects(query = {}) {
    const list = await subjectRepository.findSubjects(buildListWhere(query))
    return list.map(mapSubject)
  },

  async createSubject(payload) {
    await ensureUniqueSubject(payload)
    const subject = await subjectRepository.createSubject(payload)
    return mapSubject(subject)
  },

  async updateSubject(idValue, payload) {
    const id = toBigIntId(idValue)
    const existing = await subjectRepository.findSubjectById(id)
    if (!existing) {
      throw new AppError('学科不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    await ensureUniqueSubject(payload, existing.id)

    if (payload.subjectCode !== existing.subjectCode) {
      const usage = await countSubjectUsage(existing.subjectCode)
      if (usage.total > 0) {
        throw new AppError('学科编码已被业务数据引用，暂不支持修改', { code: ERROR_CODES.CONFLICT, status: 409 })
      }
    }

    const subject = await subjectRepository.updateSubject(id, payload)
    return mapSubject(subject)
  },

  async deleteSubject(idValue) {
    const id = toBigIntId(idValue)
    const existing = await subjectRepository.findSubjectById(id)
    if (!existing) {
      throw new AppError('学科不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    const usage = await countSubjectUsage(existing.subjectCode)
    if (usage.total > 0) {
      throw new AppError('学科已被题库、试卷或历史成绩引用，无法删除', { code: ERROR_CODES.CONFLICT, status: 409 })
    }

    await subjectRepository.deleteSubject(id)
  },

  async ensureSubjectExists(subjectCode, message = '所属科目不存在') {
    const subject = await subjectRepository.findSubjectByCode(subjectCode)
    if (!subject) {
      throw new AppError(message, { code: ERROR_CODES.VALIDATION_ERROR, status: 400 })
    }

    return subject
  },

  async getSubjectNameMap(subjectCodes = []) {
    const uniqueCodes = [...new Set(subjectCodes.filter(Boolean))]
    if (uniqueCodes.length === 0) {
      return new Map()
    }

    const list = await subjectRepository.findSubjectsByCodes(uniqueCodes)
    return new Map(list.map((item) => [item.subjectCode, item.subjectName]))
  }
}
