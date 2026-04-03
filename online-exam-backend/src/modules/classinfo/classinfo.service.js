import { classRepository } from './classinfo.repository.js'
import { AppError } from '../../common/errors/appError.js'
import { ERROR_CODES } from '../../common/constants/errorCodes.js'
import { parsePagination, buildPageResult } from '../../common/utils/pagination.js'
import { toBigIntId } from '../../common/utils/ids.js'
import { randomString } from '../../common/utils/random.js'
import { formatDateTime } from '../../common/utils/datetime.js'

const mapClass = (item) => ({
  id: item.id,
  className: item.className,
  classCode: item.classCode,
  creator: item.creator?.username || '',
  creatorId: item.creatorId,
  studentCount: item.studentCount,
  status: item.status,
  createdAt: formatDateTime(item.createdAt)
})

export const classService = {
  async listClasses(query) {
    const { pageNum, pageSize, skip, take } = parsePagination(query)
    const where = {}

    if (query.className) {
      where.className = { contains: query.className }
    }

    const [total, list] = await Promise.all([
      classRepository.countClasses(where),
      classRepository.findClasses({ where, skip, take })
    ])

    return buildPageResult({
      list: list.map(mapClass),
      total,
      pageNum,
      pageSize
    })
  },

  async createClass(payload, currentUser) {
    const existing = await classRepository.findClassByName(payload.className)
    if (existing) {
      throw new AppError('班级名称已存在', { code: ERROR_CODES.CONFLICT, status: 409 })
    }

    const classEntity = await classRepository.createClass({
      className: payload.className,
      classCode: randomString(18),
      creatorId: currentUser.id,
      studentCount: 0,
      status: 1
    })

    return mapClass(classEntity)
  },

  async updateClass(idValue, payload) {
    const id = toBigIntId(idValue)
    const classEntity = await classRepository.findClassById(id)
    if (!classEntity) {
      throw new AppError('班级不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    if (payload.className !== classEntity.className) {
      const existing = await classRepository.findClassByName(payload.className)
      if (existing) {
        throw new AppError('班级名称已存在', { code: ERROR_CODES.CONFLICT, status: 409 })
      }
    }

    const updated = await classRepository.updateClass(id, { className: payload.className })
    return mapClass(updated)
  },

  async deleteClass(idValue) {
    const id = toBigIntId(idValue)
    const classEntity = await classRepository.findClassById(id)
    if (!classEntity) {
      throw new AppError('班级不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    const studentCount = await classRepository.countStudents(id)
    if (studentCount > 0) {
      throw new AppError('班级存在学生，无法删除', { code: ERROR_CODES.CONFLICT, status: 409 })
    }

    await classRepository.deleteClass(id)
  },

  async resetCode(idValue) {
    const id = toBigIntId(idValue)
    const classEntity = await classRepository.findClassById(id)
    if (!classEntity) {
      throw new AppError('班级不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    const updated = await classRepository.updateClass(id, { classCode: randomString(18) })
    return mapClass(updated)
  }
}
