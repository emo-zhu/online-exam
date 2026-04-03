import { prisma } from '../../config/prisma.js'

const scoreOrderBy = [
  { totalScore: 'desc' },
  { submitTime: 'asc' }
]

export const scoreRepository = {
  countScores(where) {
    return prisma.examRecord.count({ where })
  },

  findScores({ where, skip, take }) {
    return prisma.examRecord.findMany({
      where,
      skip,
      take,
      orderBy: scoreOrderBy,
      include: {
        student: true
      }
    })
  },

  findScoresForStats(where) {
    return prisma.examRecord.findMany({
      where,
      select: {
        totalScore: true
      }
    })
  },

  findScoresForExport(where) {
    return prisma.examRecord.findMany({
      where,
      orderBy: scoreOrderBy,
      include: {
        student: true
      }
    })
  }
}
