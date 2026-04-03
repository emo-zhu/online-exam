import { prisma } from '../../config/prisma.js'

export const subjectRepository = {
  findSubjects(where = {}) {
    return prisma.subject.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { subjectCode: 'asc' }
      ]
    })
  },

  findSubjectById(id) {
    return prisma.subject.findUnique({
      where: { id }
    })
  },

  findSubjectByCode(subjectCode) {
    return prisma.subject.findUnique({
      where: { subjectCode }
    })
  },

  findSubjectByName(subjectName) {
    return prisma.subject.findUnique({
      where: { subjectName }
    })
  },

  findSubjectsByCodes(subjectCodes) {
    return prisma.subject.findMany({
      where: {
        subjectCode: {
          in: subjectCodes
        }
      }
    })
  },

  createSubject(data) {
    return prisma.subject.create({
      data
    })
  },

  updateSubject(id, data) {
    return prisma.subject.update({
      where: { id },
      data
    })
  },

  deleteSubject(id) {
    return prisma.subject.delete({
      where: { id }
    })
  },

  countQuestionCategoriesBySubject(subjectCode) {
    return prisma.questionCategory.count({
      where: { subject: subjectCode }
    })
  },

  countQuestionsBySubject(subjectCode) {
    return prisma.question.count({
      where: { subject: subjectCode }
    })
  },

  countPapersBySubject(subjectCode) {
    return prisma.paper.count({
      where: { subject: subjectCode }
    })
  },

  countExamRecordsBySubject(subjectCode) {
    return prisma.examRecord.count({
      where: { subjectSnapshot: subjectCode }
    })
  }
}
