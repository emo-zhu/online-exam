import { prisma } from '../../config/prisma.js'

export const questionRepository = {
  countQuestions(where) {
    return prisma.question.count({ where })
  },

  findQuestions({ where, skip, take }) {
    return prisma.question.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    })
  },

  findQuestionById(id) {
    return prisma.question.findUnique({
      where: { id },
      include: { category: true }
    })
  },

  createQuestion(data) {
    return prisma.question.create({
      data,
      include: { category: true }
    })
  },

  updateQuestion(id, data) {
    return prisma.question.update({
      where: { id },
      data,
      include: { category: true }
    })
  },

  deleteQuestion(id) {
    return prisma.question.delete({ where: { id } })
  },

  findCategoryById(id) {
    return prisma.questionCategory.findUnique({ where: { id } })
  }
}
