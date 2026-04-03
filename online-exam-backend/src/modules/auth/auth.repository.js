import { prisma } from '../../config/prisma.js'

export const authRepository = {
  findUserByUsername(username) {
    return prisma.sysUser.findUnique({
      where: { username },
      include: { userRoles: { include: { role: true } }, class: true }
    })
  },

  findUserById(id) {
    return prisma.sysUser.findUnique({
      where: { id },
      include: { userRoles: { include: { role: true } }, class: true }
    })
  },

  createUser(data) {
    return prisma.sysUser.create({ data })
  },

  updateUser(id, data) {
    return prisma.sysUser.update({ where: { id }, data })
  },

  async replaceUserRoles(userId, roleIds) {
    await prisma.sysUserRole.deleteMany({ where: { userId } })

    if (roleIds.length === 0) {
      return
    }

    await prisma.sysUserRole.createMany({
      data: roleIds.map((roleId) => ({ userId, roleId }))
    })
  },

  findRoleByCode(roleCode) {
    return prisma.sysRole.findUnique({ where: { roleCode } })
  },

  createRefreshToken(data) {
    return prisma.authRefreshToken.create({ data })
  },

  findRefreshToken(token) {
    return prisma.authRefreshToken.findUnique({
      where: { token },
      include: { user: { include: { userRoles: { include: { role: true } }, class: true } } }
    })
  },

  revokeRefreshToken(token) {
    return prisma.authRefreshToken.update({
      where: { token },
      data: { revokedAt: new Date() }
    })
  },

  revokeUserRefreshTokens(userId) {
    return prisma.authRefreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    })
  },

  createLoginLog(data) {
    return prisma.loginLog.create({ data })
  }
}
