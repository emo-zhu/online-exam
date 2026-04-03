import { readFile, rm } from 'node:fs/promises'
import * as XLSX from 'xlsx'
import bcrypt from 'bcryptjs'
import { userRepository } from './user.repository.js'
import { AppError } from '../../common/errors/appError.js'
import { ERROR_CODES } from '../../common/constants/errorCodes.js'
import { parsePagination, buildPageResult } from '../../common/utils/pagination.js'
import { toBigIntId, toNullableBigIntId } from '../../common/utils/ids.js'
import { formatDateTime } from '../../common/utils/datetime.js'

const roleNameMap = {
  admin: '管理员',
  teacher: '教师',
  student: '学生'
}

const importRoleMap = {
  admin: 'admin',
  teacher: 'teacher',
  student: 'student',
  管理员: 'admin',
  教师: 'teacher',
  学生: 'student'
}

const mapUser = (user) => {
  const roles = user.userRoles.map((item) => item.role.roleCode)
  const primaryRole = roles[0] || ''

  return {
    id: user.id,
    username: user.username,
    realName: user.realName,
    roles,
    role: primaryRole,
    roleName: roleNameMap[primaryRole] || primaryRole,
    classId: user.classId,
    className: user.class?.className || '',
    status: user.status,
    registerTime: formatDateTime(user.createdAt),
    lastLoginTime: formatDateTime(user.lastLoginTime)
  }
}

const resolveImportRole = (value) => {
  const roleText = String(value || '').trim()
  return importRoleMap[roleText] || 'student'
}

const buildUserWhere = (query = {}) => {
  const where = {}

  if (query.realName) {
    where.realName = { contains: query.realName }
  }

  if (query.role) {
    where.userRoles = {
      some: {
        role: {
          is: {
            roleCode: query.role
          }
        }
      }
    }
  }

  if (query.classId) {
    where.classId = toBigIntId(query.classId, 'classId')
  }

  return where
}

const getRoleEntity = async (roleCode) => {
  const role = await userRepository.findRoleByCode(roleCode)
  if (!role) {
    throw new AppError('角色不存在', { code: ERROR_CODES.VALIDATION_ERROR, status: 400 })
  }
  return role
}

const ensureClassExists = async (classId) => {
  if (!classId) {
    return null
  }

  const classEntity = await userRepository.findClassById(classId)
  if (!classEntity) {
    throw new AppError('班级不存在', { code: ERROR_CODES.VALIDATION_ERROR, status: 400 })
  }

  return classEntity
}

const syncClassStudentCount = async (classId) => {
  if (!classId) {
    return
  }

  const count = await userRepository.countClassStudents(classId)
  await userRepository.updateClass(classId, { studentCount: count })
}

const ensureUserCanDelete = async (user) => {
  const [classCount, noticeCount, paperCount] = await Promise.all([
    userRepository.countCreatedClasses(user.id),
    userRepository.countPublishedNotices(user.id),
    userRepository.countCreatedPapers(user.id)
  ])

  if (classCount > 0 || noticeCount > 0 || paperCount > 0) {
    throw new AppError(`用户“${user.realName}”存在关联数据，暂不可删除`, { code: ERROR_CODES.CONFLICT, status: 409 })
  }
}

const removeUserData = async (user) => {
  await userRepository.deleteUserRefreshTokens(user.id)
  await userRepository.deleteUserRoles(user.id)
  await userRepository.deleteUser(user.id)
  await syncClassStudentCount(user.classId)
}

const buildExportFilename = () => `用户管理数据_${Date.now()}.xlsx`

const buildExportBuffer = (users) => {
  const headers = ['用户名', '真实姓名', '角色', '班级', '状态', '注册时间', '最后登录时间']
  const rows = users.map((item) => ({
    用户名: item.username,
    真实姓名: item.realName,
    角色: item.roleName,
    班级: item.className,
    状态: item.status === 1 ? '启用' : '停用',
    注册时间: item.registerTime,
    最后登录时间: item.lastLoginTime || ''
  }))

  const worksheet = XLSX.utils.aoa_to_sheet([headers])
  if (rows.length > 0) {
    XLSX.utils.sheet_add_json(worksheet, rows, {
      origin: 'A2',
      skipHeader: true
    })
  }

  worksheet['!cols'] = [
    { wch: 18 },
    { wch: 14 },
    { wch: 12 },
    { wch: 18 },
    { wch: 10 },
    { wch: 22 },
    { wch: 22 }
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '用户数据')

  return XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx'
  })
}

const getUploadFile = (file) => Array.isArray(file) ? file[0] : file

export const userService = {
  async listUsers(query) {
    const { pageNum, pageSize, skip, take } = parsePagination(query)
    const where = buildUserWhere(query)

    const [total, users] = await Promise.all([
      userRepository.countUsers(where),
      userRepository.findUsers({ where, skip, take })
    ])

    return buildPageResult({
      list: users.map(mapUser),
      total,
      pageNum,
      pageSize
    })
  },

  async createUser(payload) {
    const existingUser = await userRepository.findUserByUsername(payload.username)
    if (existingUser) {
      throw new AppError('用户名已存在', { code: ERROR_CODES.CONFLICT, status: 409 })
    }

    const role = await getRoleEntity(payload.role)
    const classId = payload.role === 'student' ? toNullableBigIntId(payload.classId, 'classId') : null
    await ensureClassExists(classId)

    const passwordHash = await bcrypt.hash(payload.password || '123456', 10)
    const user = await userRepository.createUser({
      username: payload.username,
      realName: payload.realName,
      passwordHash,
      status: 1,
      classId
    })

    await userRepository.replaceUserRoles(user.id, [role.id])
    if (classId) {
      await syncClassStudentCount(classId)
    }

    const createdUser = await userRepository.findUserById(user.id)
    return mapUser(createdUser)
  },

  async importUsers(file) {
    const uploadFile = getUploadFile(file)
    if (!uploadFile?.filepath) {
      throw new AppError('请上传 Excel 文件', { code: ERROR_CODES.VALIDATION_ERROR, status: 400 })
    }

    try {
      const buffer = await readFile(uploadFile.filepath)
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const results = worksheet ? XLSX.utils.sheet_to_json(worksheet, { defval: '' }) : []

      if (!results.length) {
        throw new AppError('导入文件内容为空', { code: ERROR_CODES.VALIDATION_ERROR, status: 400 })
      }

      const classNames = [...new Set(results.map((item) => String(item['班级'] || '').trim()).filter(Boolean))]
      const classes = classNames.length > 0 ? await userRepository.findClassesByNames(classNames) : []
      const classMap = new Map(classes.map((item) => [item.className, item]))
      const usernameSet = new Set()

      const normalizedRows = results.map((row, index) => {
        const rowIndex = index + 2
        const username = String(row['用户名'] || '').trim()
        const realName = String(row['真实姓名'] || username || '').trim()
        const role = resolveImportRole(row['角色'])
        const className = String(row['班级'] || '').trim()
        const classItem = className ? classMap.get(className) : null

        if (!username) {
          throw new AppError(`第 ${rowIndex} 行用户名不能为空`, { code: ERROR_CODES.VALIDATION_ERROR, status: 400 })
        }

        if (usernameSet.has(username)) {
          throw new AppError(`导入文件中存在重复用户名：${username}`, { code: ERROR_CODES.CONFLICT, status: 409 })
        }
        usernameSet.add(username)

        if (role === 'student' && className && !classItem) {
          throw new AppError(`第 ${rowIndex} 行未找到班级“${className}”`, { code: ERROR_CODES.VALIDATION_ERROR, status: 400 })
        }

        return {
          username,
          realName,
          role,
          classId: role === 'student' ? (classItem?.id || null) : null
        }
      })

      const existingUsers = await Promise.all(normalizedRows.map((item) => userRepository.findUserByUsername(item.username)))
      const existed = existingUsers.find(Boolean)
      if (existed) {
        throw new AppError(`用户名已存在：${existed.username}`, { code: ERROR_CODES.CONFLICT, status: 409 })
      }

      for (const item of normalizedRows) {
        await this.createUser(item)
      }

      return {
        total: normalizedRows.length,
        successCount: normalizedRows.length
      }
    } finally {
      await rm(uploadFile.filepath, { force: true })
    }
  },

  async exportUsers(query) {
    const where = buildUserWhere(query)
    const users = await userRepository.findUsers({ where })
    const mappedUsers = users.map(mapUser)

    return {
      filename: buildExportFilename(),
      buffer: buildExportBuffer(mappedUsers)
    }
  },

  async updateUser(idValue, payload) {
    const id = toBigIntId(idValue)
    const user = await userRepository.findUserById(id)
    if (!user) {
      throw new AppError('用户不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    const nextRoleCode = payload.role || user.userRoles[0]?.role.roleCode || 'student'
    const nextRole = await getRoleEntity(nextRoleCode)
    const nextClassId = nextRoleCode === 'student'
      ? toNullableBigIntId(payload.classId ?? user.classId, 'classId')
      : null

    await ensureClassExists(nextClassId)

    await userRepository.updateUser(id, {
      realName: payload.realName ?? user.realName,
      status: payload.status ?? user.status,
      classId: nextClassId
    })

    await userRepository.replaceUserRoles(id, [nextRole.id])

    await Promise.all([
      syncClassStudentCount(user.classId),
      syncClassStudentCount(nextClassId)
    ])

    const updatedUser = await userRepository.findUserById(id)
    return mapUser(updatedUser)
  },

  async updateStatus(idValue, payload) {
    return this.updateUser(idValue, { status: payload.status })
  },

  async resetPassword(idValue, payload) {
    const id = toBigIntId(idValue)
    const user = await userRepository.findUserById(id)
    if (!user) {
      throw new AppError('用户不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    const passwordHash = await bcrypt.hash(payload.newPassword || '123456', 10)
    await userRepository.updateUser(id, { passwordHash })
  },

  async batchDeleteUsers(payload) {
    const idStrings = [...new Set(payload.ids.map((item) => toBigIntId(item, 'id').toString()))]
    const users = []

    for (const idString of idStrings) {
      const user = await userRepository.findUserById(BigInt(idString))
      if (!user) {
        throw new AppError('用户不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
      }
      users.push(user)
    }

    for (const user of users) {
      await ensureUserCanDelete(user)
    }

    for (const user of users) {
      await removeUserData(user)
    }

    return {
      deletedCount: users.length
    }
  },

  async deleteUser(idValue) {
    const id = toBigIntId(idValue)
    const user = await userRepository.findUserById(id)
    if (!user) {
      throw new AppError('用户不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    await ensureUserCanDelete(user)
    await removeUserData(user)
  }
}
