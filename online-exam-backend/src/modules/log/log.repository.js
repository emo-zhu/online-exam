import { prisma } from '../../config/prisma.js'

export const logRepository = {
  countLogs(where) {
    return prisma.loginLog.count({ where })
  },

  findLogs({ where, skip, take }) {
    return prisma.loginLog.findMany({
      where,
      skip,
      take,
      orderBy: { loginTime: 'desc' }
    })
  },

  clearLogs() {
    return prisma.loginLog.deleteMany({})
  }
}
