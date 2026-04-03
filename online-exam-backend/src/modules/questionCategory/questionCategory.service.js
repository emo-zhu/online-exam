import { questionCategoryRepository } from './questionCategory.repository.js'
import { AppError } from '../../common/errors/appError.js'
import { ERROR_CODES } from '../../common/constants/errorCodes.js'
import { parsePagination, buildPageResult } from '../../common/utils/pagination.js'
import { toBigIntId } from '../../common/utils/ids.js'
import { formatDateTime } from '../../common/utils/datetime.js'
import { subjectService } from '../subject/subject.service.js'

const mapCategory = (item, subjectNameMap = new Map()) => ({
  id: item.id,
  name: item.name,
  subject: item.subject,
  subjectName: subjectNameMap.get(item.subject) || item.subject,
  desc: item.description || '',
  status: item.status,
  questionCount: item._count?.questions || 0,
  createdAt: formatDateTime(item.createdAt)
})

export const questionCategoryService = {
  async listCategories(query) {
    const { pageNum, pageSize, skip, take } = parsePagination(query)
    const where = {}

    if (query.name) {
      where.name = { contains: query.name }
    }

    if (query.subject) {
      where.subject = query.subject
    }

    const [total, list] = await Promise.all([
      questionCategoryRepository.countCategories(where),
      questionCategoryRepository.findCategories({ where, skip, take })
    ])
    const subjectNameMap = await subjectService.getSubjectNameMap(list.map((item) => item.subject))

    return buildPageResult({
      list: list.map((item) => mapCategory(item, subjectNameMap)),
      total,
      pageNum,
      pageSize
    })
  },

  async createCategory(payload) {
    await subjectService.ensureSubjectExists(payload.subject)
    const existing = await questionCategoryRepository.findCategoryByNameAndSubject(payload.subject, payload.name)
    if (existing) {
      throw new AppError('同一科目下分类名称已存在', { code: ERROR_CODES.CONFLICT, status: 409 })
    }

    const category = await questionCategoryRepository.createCategory({
      name: payload.name,
      subject: payload.subject,
      description: payload.desc || '',
      status: 1
    })
    const subjectNameMap = await subjectService.getSubjectNameMap([category.subject])

    return mapCategory(category, subjectNameMap)
  },

  async updateCategory(idValue, payload) {
    const id = toBigIntId(idValue)
    const existing = await questionCategoryRepository.findCategoryById(id)
    if (!existing) {
      throw new AppError('分类不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    await subjectService.ensureSubjectExists(payload.subject)

    if (payload.subject !== existing.subject && (existing._count?.questions || 0) > 0) {
      throw new AppError('分类下存在关联试题，不能修改所属科目', { code: ERROR_CODES.CONFLICT, status: 409 })
    }

    if (payload.name !== existing.name || payload.subject !== existing.subject) {
      const duplicate = await questionCategoryRepository.findCategoryByNameAndSubject(payload.subject, payload.name)
      if (duplicate && duplicate.id !== existing.id) {
        throw new AppError('同一科目下分类名称已存在', { code: ERROR_CODES.CONFLICT, status: 409 })
      }
    }

    const category = await questionCategoryRepository.updateCategory(id, {
      name: payload.name,
      subject: payload.subject,
      description: payload.desc || ''
    })
    const subjectNameMap = await subjectService.getSubjectNameMap([category.subject])

    return mapCategory(category, subjectNameMap)
  },

  async deleteCategory(idValue) {
    const id = toBigIntId(idValue)
    const existing = await questionCategoryRepository.findCategoryById(id)
    if (!existing) {
      throw new AppError('分类不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    const questionCount = await questionCategoryRepository.countQuestions(id)
    if (questionCount > 0) {
      throw new AppError('该分类下存在关联试题，无法删除', { code: ERROR_CODES.CONFLICT, status: 409 })
    }

    await questionCategoryRepository.deleteCategory(id)
  }
}
