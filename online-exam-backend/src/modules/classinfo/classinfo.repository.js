import { prisma } from '../../config/prisma.js'

export const classRepository = {
  countClasses(where) {
    return prisma.eduClass.count({ where })
  },

  findClasses({ where, skip, take }) {
    return prisma.eduClass.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { creator: true }
    })
  },

  findClassById(id) {
    return prisma.eduClass.findUnique({ where: { id }, include: { creator: true } })
  },

  findClassByName(className) {
    return prisma.eduClass.findUnique({ where: { className } })
  },

  createClass(data) {
    return prisma.eduClass.create({ data, include: { creator: true } })
  },

  updateClass(id, data) {
    return prisma.eduClass.update({ where: { id }, data, include: { creator: true } })
  },

  deleteClass(id) {
    return prisma.eduClass.delete({ where: { id } })
  },

  countStudents(classId) {
    return prisma.sysUser.count({ where: { classId, status: 1 } })
  }
}
