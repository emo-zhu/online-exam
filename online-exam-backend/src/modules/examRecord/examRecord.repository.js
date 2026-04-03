import { prisma } from '../../config/prisma.js'

const buildStudentPaperWhere = (classId) => {
  if (!classId) {
    return {
      status: 1,
      paperTargetClasses: {
        none: {}
      }
    }
  }

  return {
    status: 1,
    OR: [
      {
        paperTargetClasses: {
          none: {}
        }
      },
      {
        paperTargetClasses: {
          some: {
            classId
          }
        }
      }
    ]
  }
}

export const examRecordRepository = {
  findStudentById(id) {
    return prisma.sysUser.findUnique({
      where: { id },
      include: { class: true }
    })
  },

  findPublishedPapersByStudent(studentId, classId) {
    return prisma.paper.findMany({
      where: buildStudentPaperWhere(classId),
      orderBy: [
        { startTime: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        paperTargetClasses: true,
        examRecords: {
          where: { studentId },
          select: {
            id: true,
            status: true,
            submitTime: true,
            totalScore: true
          }
        }
      }
    })
  },

  findPublishedPapersForAdmin(studentId) {
    return prisma.paper.findMany({
      where: { status: 1 },
      orderBy: [
        { startTime: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        paperTargetClasses: true,
        examRecords: {
          where: { studentId },
          select: {
            id: true,
            status: true,
            submitTime: true,
            totalScore: true
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
        paperTargetClasses: true
      }
    })
  },

  findRecordByPaperAndStudent(paperId, studentId) {
    return prisma.examRecord.findUnique({
      where: {
        paperId_studentId: {
          paperId,
          studentId
        }
      },
      include: {
        answers: {
          include: {
            paperQuestion: true
          },
          orderBy: {
            paperQuestion: {
              sortOrder: 'asc'
            }
          }
        },
        paper: {
          include: {
            paperQuestions: {
              orderBy: {
                sortOrder: 'asc'
              }
            },
            paperTargetClasses: true
          }
        },
        student: {
          include: { class: true }
        }
      }
    })
  },

  updateRecordStartedAt(recordId, startedAt) {
    return prisma.examRecord.update({
      where: { id: recordId },
      data: { startedAt },
      include: {
        answers: {
          include: {
            paperQuestion: true
          },
          orderBy: {
            paperQuestion: {
              sortOrder: 'asc'
            }
          }
        },
        paper: {
          include: {
            paperQuestions: {
              orderBy: {
                sortOrder: 'asc'
              }
            },
            paperTargetClasses: true
          }
        },
        student: {
          include: { class: true }
        }
      }
    })
  },

  createStartedRecord({ paper, student, startedAt }) {
    return prisma.examRecord.create({
      data: {
        paperId: paper.id,
        studentId: student.id,
        examNameSnapshot: paper.paperName,
        subjectSnapshot: paper.subject,
        classNameSnapshot: student.class?.className || '',
        objectiveScore: 0,
        subjectiveScore: 0,
        totalScore: 0,
        status: 0,
        startedAt,
        submitTime: null,
        forcedSubmit: 0,
        cheatCount: 0
      },
      include: {
        answers: {
          include: {
            paperQuestion: true
          },
          orderBy: {
            paperQuestion: {
              sortOrder: 'asc'
            }
          }
        },
        paper: {
          include: {
            paperQuestions: {
              orderBy: {
                sortOrder: 'asc'
              }
            },
            paperTargetClasses: true
          }
        },
        student: {
          include: { class: true }
        }
      }
    })
  },

  autosaveRecord({ recordId, cheatCount, answerRows }) {
    return prisma.$transaction(async (tx) => {
      await tx.examRecord.update({
        where: { id: recordId },
        data: {
          cheatCount
        }
      })

      await tx.examRecordAnswer.deleteMany({ where: { recordId } })

      for (const item of answerRows) {
        await tx.examRecordAnswer.create({
          data: {
            recordId,
            questionId: item.questionId,
            paperQuestionId: item.paperQuestionId,
            answer: item.answer,
            isCorrect: 0,
            score: 0,
            comment: null
          }
        })
      }

      return tx.examRecord.findUnique({
        where: { id: recordId },
        include: {
          answers: {
            include: {
              paperQuestion: true
            },
            orderBy: {
              paperQuestion: {
                sortOrder: 'asc'
              }
            }
          },
          paper: {
            include: {
              paperQuestions: {
                orderBy: {
                  sortOrder: 'asc'
                }
              },
              paperTargetClasses: true
            }
          },
          student: {
            include: { class: true }
          }
        }
      })
    })
  },

  saveSubmittedRecord({ existingRecordId, paper, student, startedAt, status, objectiveScore, subjectiveScore, totalScore, submitTime, forcedSubmit, cheatCount, answerRows, wrongBookRows }) {
    return prisma.$transaction(async (tx) => {
      const recordData = {
        paperId: paper.id,
        studentId: student.id,
        examNameSnapshot: paper.paperName,
        subjectSnapshot: paper.subject,
        classNameSnapshot: student.class?.className || '',
        objectiveScore,
        subjectiveScore,
        totalScore,
        status,
        startedAt: startedAt || submitTime,
        submitTime,
        forcedSubmit,
        cheatCount
      }

      let record
      if (existingRecordId) {
        record = await tx.examRecord.update({
          where: { id: existingRecordId },
          data: recordData
        })
        await tx.examRecordAnswer.deleteMany({ where: { recordId: record.id } })
        await tx.wrongBook.deleteMany({ where: { recordId: record.id } })
      } else {
        record = await tx.examRecord.create({ data: recordData })
      }

      for (const item of answerRows) {
        await tx.examRecordAnswer.create({
          data: {
            recordId: record.id,
            questionId: item.questionId,
            paperQuestionId: item.paperQuestionId,
            answer: item.answer,
            isCorrect: item.isCorrect,
            score: item.score,
            comment: item.comment || null
          }
        })
      }

      if (wrongBookRows.length > 0) {
        await tx.wrongBook.createMany({
          data: wrongBookRows.map((item) => ({
            studentId: student.id,
            recordId: record.id,
            paperQuestionId: item.paperQuestionId,
            questionId: item.questionId,
            myAnswer: item.myAnswer,
            correctAnswer: item.correctAnswer
          }))
        })
      }

      return tx.examRecord.findUnique({
        where: { id: record.id },
        include: {
          answers: {
            include: {
              paperQuestion: true
            },
            orderBy: {
              paperQuestion: {
                sortOrder: 'asc'
              }
            }
          },
          paper: {
            include: {
              paperQuestions: {
                orderBy: {
                  sortOrder: 'asc'
                }
              },
              paperTargetClasses: true
            }
          },
          student: {
            include: { class: true }
          }
        }
      })
    })
  },

  findStudentSubmittedRecords(studentId) {
    return prisma.examRecord.findMany({
      where: {
        studentId,
        submitTime: { not: null }
      },
      orderBy: { submitTime: 'desc' },
      include: {
        paper: true,
        student: {
          include: { class: true }
        }
      }
    })
  },

  findRecordById(id) {
    return prisma.examRecord.findUnique({
      where: { id },
      include: {
        paper: {
          include: {
            paperQuestions: {
              orderBy: {
                sortOrder: 'asc'
              }
            },
            paperTargetClasses: true
          }
        },
        student: {
          include: { class: true }
        },
        answers: {
          include: {
            paperQuestion: true
          },
          orderBy: {
            paperQuestion: {
              sortOrder: 'asc'
            }
          }
        }
      }
    })
  },

  countRecords(where) {
    return prisma.examRecord.count({ where })
  },

  findRecords({ where, skip, take }) {
    return prisma.examRecord.findMany({
      where,
      skip,
      take,
      orderBy: { submitTime: 'desc' },
      include: {
        paper: true,
        student: {
          include: { class: true }
        }
      }
    })
  },

  submitTeacherMark({ recordId, totalScore, subjectiveScore, answerMarks, wrongBookRows, textQuestionIds }) {
    return prisma.$transaction(async (tx) => {
      for (const item of answerMarks) {
        await tx.examRecordAnswer.update({
          where: { id: item.answerId },
          data: {
            score: item.score,
            comment: item.comment || null,
            isCorrect: item.isCorrect
          }
        })
      }

      await tx.wrongBook.deleteMany({
        where: {
          recordId,
          paperQuestionId: {
            in: textQuestionIds
          }
        }
      })

      if (wrongBookRows.length > 0) {
        await tx.wrongBook.createMany({ data: wrongBookRows })
      }

      await tx.examRecord.update({
        where: { id: recordId },
        data: {
          status: 2,
          subjectiveScore,
          totalScore,
          markedAt: new Date()
        }
      })

      return tx.examRecord.findUnique({
        where: { id: recordId },
        include: {
          paper: true,
          student: {
            include: { class: true }
          },
          answers: {
            include: {
              paperQuestion: true
            },
            orderBy: {
              paperQuestion: {
                sortOrder: 'asc'
              }
            }
          }
        }
      })
    })
  },

  findWrongBookById(id) {
    return prisma.wrongBook.findUnique({
      where: { id },
      include: {
        record: true,
        paperQuestion: true
      }
    })
  },

  deleteWrongBook(id) {
    return prisma.wrongBook.delete({ where: { id } })
  },

  findWrongBooksByStudent(studentId) {
    return prisma.wrongBook.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      include: {
        record: true,
        paperQuestion: true
      }
    })
  }
}
