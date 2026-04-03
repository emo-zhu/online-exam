import { prisma } from '../../config/prisma.js'

const userInclude = {
  class: true,
  userRoles: {
    include: {
      role: true
    }
  }
}

export const userRepository = {
  findUserById(id) {
    return prisma.sysUser.findUnique({
      where: { id },
      include: userInclude
    })
  },

  findUserByUsername(username) {
    return prisma.sysUser.findUnique({
      where: { username },
      include: userInclude
    })
  },

  countUsers(where) {
    return prisma.sysUser.count({ where })
  },

  findUsers({ where, skip, take }) {
    return prisma.sysUser.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: userInclude
    })
  },

  findClassesByNames(classNames) {
    return prisma.eduClass.findMany({
      where: {
        className: {
          in: classNames
        }
      }
    })
  },

  createUser(data) {
    return prisma.sysUser.create({ data })
  },

  updateUser(id, data) {
    return prisma.sysUser.update({ where: { id }, data })
  },

  deleteUser(id) {
    return prisma.sysUser.delete({ where: { id } })
  },

  replaceUserRoles(userId, roleIds) {
    return prisma.$transaction(async (tx) => {
      await tx.sysUserRole.deleteMany({ where: { userId } })
      if (roleIds.length > 0) {
        await tx.sysUserRole.createMany({ data: roleIds.map((roleId) => ({ userId, roleId })) })
      }
    })
  },

  findRoleByCode(roleCode) {
    return prisma.sysRole.findUnique({ where: { roleCode } })
  },

  findClassById(id) {
    return prisma.eduClass.findUnique({ where: { id } })
  },

  countCreatedClasses(creatorId) {
    return prisma.eduClass.count({ where: { creatorId } })
  },

  countPublishedNotices(publisherId) {
    return prisma.notice.count({ where: { publisherId } })
  },

  countCreatedPapers(creatorId) {
    return prisma.paper.count({ where: { creatorId } })
  },

  deleteUserRoles(userId) {
    return prisma.sysUserRole.deleteMany({ where: { userId } })
  },

  deleteUserRefreshTokens(userId) {
    return prisma.authRefreshToken.deleteMany({ where: { userId } })
  },

  countClassStudents(classId) {
    return prisma.sysUser.count({ where: { classId, status: 1 } })
  },

  updateClass(id, data) {
    return prisma.eduClass.update({ where: { id }, data })
  }
}
