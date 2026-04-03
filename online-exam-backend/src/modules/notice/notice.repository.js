import { prisma } from '../../config/prisma.js'

export const noticeRepository = {
  countNotices(where) {
    return prisma.notice.count({ where })
  },

  findNotices({ where, skip, take }) {
    return prisma.notice.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { publisher: true }
    })
  },

  findNoticeById(id) {
    return prisma.notice.findUnique({ where: { id }, include: { publisher: true } })
  },

  createNotice(data) {
    return prisma.notice.create({ data, include: { publisher: true } })
  },

  updateNotice(id, data) {
    return prisma.notice.update({ where: { id }, data, include: { publisher: true } })
  },

  deleteNotice(id) {
    return prisma.notice.delete({ where: { id } })
  }
}
