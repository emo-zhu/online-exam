import { prisma } from '../../config/prisma.js'

export const questionCategoryRepository = {
  countCategories(where) {
    return prisma.questionCategory.count({ where })
  },

  findCategories({ where, skip, take }) {
    return prisma.questionCategory.findMany({
      where,
      skip,
      take,
      orderBy: [{ subject: 'asc' }, { createdAt: 'desc' }],
      include: {
        _count: {
          select: {
            questions: true
          }
        }
      }
    })
  },

  findCategoryById(id) {
    return prisma.questionCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            questions: true
          }
        }
      }
    })
  },

  findCategoryByNameAndSubject(subject, name) {
    return prisma.questionCategory.findFirst({
      where: { subject, name }
    })
  },

  createCategory(data) {
    return prisma.questionCategory.create({
      data,
      include: {
        _count: {
          select: {
            questions: true
          }
        }
      }
    })
  },

  updateCategory(id, data) {
    return prisma.questionCategory.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            questions: true
          }
        }
      }
    })
  },

  deleteCategory(id) {
    return prisma.questionCategory.delete({ where: { id } })
  },

  countQuestions(id) {
    return prisma.question.count({ where: { categoryId: id } })
  }
}
