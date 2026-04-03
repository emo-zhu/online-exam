import { prisma } from '../../config/prisma.js'

export const paperRepository = {
  countPapers(where) {
    return prisma.paper.count({ where })
  },

  findPapers({ where, skip, take }) {
    return prisma.paper.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        paperTargetClasses: {
          include: {
            class: true
          },
          orderBy: {
            class: {
              className: 'asc'
            }
          }
        },
        _count: {
          select: {
            paperQuestions: true,
            examRecords: true
          }
        }
      }
    })
  },

  findPaperById(id) {
    return prisma.paper.findUnique({
      where: { id },
      include: {
        paperQuestions: {
          orderBy: { sortOrder: 'asc' }
        },
        paperTargetClasses: {
          include: {
            class: true
          },
          orderBy: {
            class: {
              className: 'asc'
            }
          }
        },
        _count: {
          select: {
            examRecords: true
          }
        }
      }
    })
  },

  findQuestionById(id) {
    return prisma.question.findUnique({ where: { id } })
  },

  findClassesByIds(ids) {
    return prisma.eduClass.findMany({
      where: {
        id: {
          in: ids
        }
      },
      orderBy: {
        className: 'asc'
      }
    })
  },

  createPaper(data) {
    return prisma.paper.create({ data })
  },

  updatePaper(id, data) {
    return prisma.paper.update({
      where: { id },
      data
    })
  },

  deletePaper(id) {
    return prisma.paper.delete({ where: { id } })
  },

  countSubmittedExamRecordsByPaper(paperId) {
    return prisma.examRecord.count({
      where: {
        paperId,
        submitTime: {
          not: null
        }
      }
    })
  }
}
