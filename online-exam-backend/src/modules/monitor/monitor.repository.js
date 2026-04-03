import { prisma } from '../../config/prisma.js'

const studentWhere = {
  status: 1,
  userRoles: {
    some: {
      role: {
        roleCode: 'student'
      }
    }
  }
}

export const monitorRepository = {
  countActiveStudents() {
    return prisma.sysUser.count({ where: studentWhere })
  },

  findActiveExams(now) {
    return prisma.paper.findMany({
      where: {
        status: 1,
        AND: [
          {
            OR: [{ startTime: null }, { startTime: { lte: now } }]
          },
          {
            OR: [{ endTime: null }, { endTime: { gte: now } }]
          }
        ]
      },
      orderBy: [
        { startTime: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        examRecords: {
          where: {
            submitTime: { not: null }
          },
          select: {
            id: true
          }
        }
      }
    })
  },

  findPaperById(id) {
    return prisma.paper.findUnique({
      where: { id }
    })
  },

  findStudentById(id) {
    return prisma.sysUser.findUnique({
      where: { id },
      include: {
        class: true,
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })
  },

  findMonitorStudents(paperId) {
    return prisma.sysUser.findMany({
      where: studentWhere,
      orderBy: [
        {
          class: {
            className: 'asc'
          }
        },
        {
          realName: 'asc'
        }
      ],
      include: {
        class: true,
        loginLogs: {
          orderBy: { loginTime: 'desc' },
          take: 1
        },
        examRecords: {
          where: { paperId },
          take: 1,
          select: {
            id: true,
            status: true,
            submitTime: true,
            forcedSubmit: true,
            cheatCount: true
          }
        }
      }
    })
  },

  createMonitorLog(data) {
    return prisma.monitorLog.create({
      data,
      include: {
        paper: true,
        student: true,
        operator: true
      }
    })
  },

  findMonitorLogs({ where, take = 100 }) {
    return prisma.monitorLog.findMany({
      where,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        paper: true,
        student: true,
        operator: true
      }
    })
  }
}
