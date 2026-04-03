import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const createLoginLog = (username, status, message, userId = null) => ({
  usernameSnapshot: username,
  status,
  message,
  ip: '127.0.0.1',
  location: '本地环境',
  browser: 'Seed Script',
  os: 'Node.js',
  loginTime: new Date(),
  ...(userId ? { userId } : {})
})

const ensureSubject = (data) => prisma.subject.upsert({
  where: { subjectCode: data.subjectCode },
  update: {
    subjectName: data.subjectName,
    sortOrder: data.sortOrder
  },
  create: data
})

const ensureQuestionCategory = (data) => prisma.questionCategory.upsert({
  where: { subject_name: { subject: data.subject, name: data.name } },
  update: { description: data.description, status: 1 },
  create: data
})

const normalizeQuestionAnswer = (question) => {
  if (question.type === 'select') {
    return question.answers || []
  }

  return question.answer || ''
}

const ensureQuestion = async (question) => {
  const existing = await prisma.question.findFirst({ where: { title: question.title, subject: question.subject } })

  if (existing) {
    return prisma.question.update({
      where: { id: existing.id },
      data: {
        categoryId: question.categoryId,
        type: question.type,
        score: question.score,
        options: question.options || null,
        answer: normalizeQuestionAnswer(question),
        status: 1
      }
    })
  }

  return prisma.question.create({
    data: {
      subject: question.subject,
      categoryId: question.categoryId,
      type: question.type,
      title: question.title,
      score: question.score,
      options: question.options || null,
      answer: normalizeQuestionAnswer(question),
      status: 1
    }
  })
}

const ensurePaper = async ({ paperName, subject, duration, startTime, endTime, status = 1, creatorId, questionTitles, classIds = [] }) => {
  const sourceQuestions = await prisma.question.findMany({
    where: {
      title: {
        in: questionTitles
      }
    }
  })
  const questionMap = new Map(sourceQuestions.map((item) => [item.title, item]))
  const orderedQuestions = questionTitles.map((title) => {
    const question = questionMap.get(title)
    if (!question) {
      throw new Error(`试题不存在: ${title}`)
    }
    return question
  })
  const totalScore = orderedQuestions.reduce((sum, item) => sum + item.score, 0)
  const paperQuestionData = orderedQuestions.map((question, index) => ({
    questionId: question.id,
    subject: question.subject,
    type: question.type,
    title: question.title,
    options: question.options || null,
    answer: question.answer || null,
    analysis: question.analysis || '',
    sortOrder: index + 1,
    score: question.score
  }))
  const paperTargetClassData = Array.from(new Set(classIds.map((item) => item.toString()))).map((classId) => ({
    classId: BigInt(classId)
  }))

  const existing = await prisma.paper.findFirst({
    where: { paperName },
    include: {
      paperQuestions: {
        orderBy: { sortOrder: 'asc' }
      },
      paperTargetClasses: true
    }
  })

  if (existing) {
    return prisma.paper.update({
      where: { id: existing.id },
      data: {
        subject,
        totalScore,
        duration,
        startTime,
        endTime,
        status,
        creatorId,
        paperQuestions: {
          deleteMany: {},
          create: paperQuestionData
        },
        paperTargetClasses: {
          deleteMany: {},
          ...(paperTargetClassData.length > 0 ? { create: paperTargetClassData } : {})
        }
      },
      include: {
        paperQuestions: {
          orderBy: { sortOrder: 'asc' }
        },
        paperTargetClasses: true
      }
    })
  }

  return prisma.paper.create({
    data: {
      paperName,
      subject,
      totalScore,
      duration,
      startTime,
      endTime,
      status,
      creatorId,
      paperQuestions: {
        create: paperQuestionData
      },
      ...(paperTargetClassData.length > 0
        ? {
            paperTargetClasses: {
              create: paperTargetClassData
            }
          }
        : {})
    },
    include: {
      paperQuestions: {
        orderBy: { sortOrder: 'asc' }
      },
      paperTargetClasses: true
    }
  })
}

const upsertDemoLoginLog = async (user) => {
  const existing = await prisma.loginLog.findFirst({
    where: {
      userId: user.id,
      message: '演示环境自动登录'
    }
  })

  if (existing) {
    return prisma.loginLog.update({
      where: { id: existing.id },
      data: {
        usernameSnapshot: user.username,
        status: 1,
        message: '演示环境自动登录',
        ip: '127.0.0.1',
        location: '本地环境',
        browser: 'Seed Script',
        os: 'Node.js',
        loginTime: new Date()
      }
    })
  }

  return prisma.loginLog.create({
    data: createLoginLog(user.username, 1, '演示环境自动登录', user.id)
  })
}

const rebuildMarkedRecord = async ({ paper, student, startedAt, submitTime, markedAt, forcedSubmit = 0, cheatCount = 0, answerItems, wrongBookItems = [] }) => {
  const objectiveScore = answerItems
    .filter((item) => item.type !== 'text')
    .reduce((sum, item) => sum + item.score, 0)
  const subjectiveScore = answerItems
    .filter((item) => item.type === 'text')
    .reduce((sum, item) => sum + item.score, 0)
  const totalScore = objectiveScore + subjectiveScore

  const record = await prisma.examRecord.upsert({
    where: {
      paperId_studentId: {
        paperId: paper.id,
        studentId: student.id
      }
    },
    update: {
      examNameSnapshot: paper.paperName,
      subjectSnapshot: paper.subject,
      classNameSnapshot: student.class?.className || '',
      totalScore,
      objectiveScore,
      subjectiveScore,
      status: 2,
      startedAt,
      submitTime,
      markedAt,
      forcedSubmit,
      cheatCount
    },
    create: {
      paperId: paper.id,
      studentId: student.id,
      examNameSnapshot: paper.paperName,
      subjectSnapshot: paper.subject,
      classNameSnapshot: student.class?.className || '',
      totalScore,
      objectiveScore,
      subjectiveScore,
      status: 2,
      startedAt,
      submitTime,
      markedAt,
      forcedSubmit,
      cheatCount
    }
  })

  await prisma.examRecordAnswer.deleteMany({
    where: { recordId: record.id }
  })
  await prisma.wrongBook.deleteMany({
    where: { recordId: record.id }
  })

  for (const item of answerItems) {
    await prisma.examRecordAnswer.create({
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

  for (const item of wrongBookItems) {
    await prisma.wrongBook.create({
      data: {
        studentId: student.id,
        recordId: record.id,
        paperQuestionId: item.paperQuestionId,
        questionId: item.questionId,
        myAnswer: item.myAnswer,
        correctAnswer: item.correctAnswer
      }
    })
  }
}

const buildPaperQuestionMap = (paper) => new Map((paper.paperQuestions || []).map((item) => [item.title, item]))

const getPaperQuestionByTitle = (paperQuestionMap, title) => {
  const item = paperQuestionMap.get(title)
  if (!item) {
    throw new Error(`试卷题目不存在: ${title}`)
  }
  return item
}

const upsertMonitorLog = async ({ paperId, studentId = null, operatorId = null, type, content, result = '成功' }) => {
  const existing = await prisma.monitorLog.findFirst({
    where: {
      paperId,
      studentId,
      operatorId,
      type,
      content
    }
  })

  if (existing) {
    return prisma.monitorLog.update({
      where: { id: existing.id },
      data: {
        result,
        operatorId
      }
    })
  }

  return prisma.monitorLog.create({
    data: {
      paperId,
      studentId,
      operatorId,
      type,
      content,
      result
    }
  })
}

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10)

  const roleConfigs = [
    { roleCode: 'admin', roleName: '管理员' },
    { roleCode: 'teacher', roleName: '教师' },
    { roleCode: 'student', roleName: '学生' }
  ]

  for (const role of roleConfigs) {
    await prisma.sysRole.upsert({
      where: { roleCode: role.roleCode },
      update: { roleName: role.roleName },
      create: role
    })
  }

  const subjectSeeds = [
    { subjectCode: 'math', subjectName: '数学', sortOrder: 1 },
    { subjectCode: 'chinese', subjectName: '语文', sortOrder: 2 },
    { subjectCode: 'english', subjectName: '英语', sortOrder: 3 },
    { subjectCode: 'cs', subjectName: '计算机', sortOrder: 4 }
  ]

  for (const subject of subjectSeeds) {
    await ensureSubject(subject)
  }

  const admin = await prisma.sysUser.upsert({
    where: { username: 'admin' },
    update: { realName: '管理员', passwordHash, status: 1 },
    create: { username: 'admin', realName: '管理员', passwordHash, status: 1 }
  })

  const classOne = await prisma.eduClass.upsert({
    where: { classCode: 'CLASS202601A' },
    update: { className: '三年级01班', creatorId: admin.id, status: 1 },
    create: {
      className: '三年级01班',
      classCode: 'CLASS202601A',
      creatorId: admin.id,
      status: 1
    }
  })

  const classTwo = await prisma.eduClass.upsert({
    where: { classCode: 'CLASS202601B' },
    update: { className: '二年级01班', creatorId: admin.id, status: 1 },
    create: {
      className: '二年级01班',
      classCode: 'CLASS202601B',
      creatorId: admin.id,
      status: 1
    }
  })

  const teacher = await prisma.sysUser.upsert({
    where: { username: 'teacher' },
    update: { realName: '示例教师', passwordHash, status: 1, classId: null },
    create: { username: 'teacher', realName: '示例教师', passwordHash, status: 1 }
  })

  const student = await prisma.sysUser.upsert({
    where: { username: 'student' },
    update: { realName: '示例学生', passwordHash, status: 1, classId: classOne.id },
    create: {
      username: 'student',
      realName: '示例学生',
      passwordHash,
      status: 1,
      classId: classOne.id
    }
  })

  const studentTwo = await prisma.sysUser.upsert({
    where: { username: 'student01' },
    update: { realName: '演示学生甲', passwordHash, status: 1, classId: classOne.id },
    create: {
      username: 'student01',
      realName: '演示学生甲',
      passwordHash,
      status: 1,
      classId: classOne.id
    }
  })

  const studentThree = await prisma.sysUser.upsert({
    where: { username: 'student02' },
    update: { realName: '演示学生乙', passwordHash, status: 1, classId: classTwo.id },
    create: {
      username: 'student02',
      realName: '演示学生乙',
      passwordHash,
      status: 1,
      classId: classTwo.id
    }
  })

  const roles = await prisma.sysRole.findMany()
  const roleMap = new Map(roles.map((role) => [role.roleCode, role.id]))

  const userRolePairs = [
    { userId: admin.id, roleId: roleMap.get('admin') },
    { userId: teacher.id, roleId: roleMap.get('teacher') },
    { userId: student.id, roleId: roleMap.get('student') },
    { userId: studentTwo.id, roleId: roleMap.get('student') },
    { userId: studentThree.id, roleId: roleMap.get('student') }
  ]

  for (const pair of userRolePairs) {
    await prisma.sysUserRole.upsert({
      where: { userId_roleId: pair },
      update: {},
      create: pair
    })
  }

  await prisma.eduClass.update({
    where: { id: classOne.id },
    data: { studentCount: await prisma.sysUser.count({ where: { classId: classOne.id, status: 1 } }) }
  })

  await prisma.eduClass.update({
    where: { id: classTwo.id },
    data: { studentCount: await prisma.sysUser.count({ where: { classId: classTwo.id, status: 1 } }) }
  })

  await prisma.notice.upsert({
    where: { id: 1n },
    update: {
      title: '关于春季考试安排的通知',
      content: '请相关教师与学生关注考试时间与班级安排。',
      type: 'exam',
      status: 1,
      publisherId: admin.id,
      publishTime: new Date()
    },
    create: {
      id: 1n,
      title: '关于春季考试安排的通知',
      content: '请相关教师与学生关注考试时间与班级安排。',
      type: 'exam',
      status: 1,
      publisherId: admin.id,
      publishTime: new Date()
    }
  })

  const mathCategory = await ensureQuestionCategory({ name: '函数与导数', subject: 'math', description: '包含一次函数、二次函数、指数函数等', status: 1 })
  const chineseCategory = await ensureQuestionCategory({ name: '古诗词', subject: 'chinese', description: '唐诗宋词默写与鉴赏', status: 1 })
  const englishCategory = await ensureQuestionCategory({ name: '语法基础', subject: 'english', description: '基础语法与词汇运用', status: 1 })
  const csCategory = await ensureQuestionCategory({ name: 'Vue生态', subject: 'cs', description: 'Vue3、Vite、Pinia 等前端基础', status: 1 })

  const questionSeeds = [
    {
      subject: 'math',
      categoryId: mathCategory.id,
      type: 'judge',
      title: '已知函数 f(x) = x^2, 求 f(2) = ?',
      score: 40,
      options: { A: '2', B: '4', C: '6', D: '8' },
      answer: 'B'
    },
    {
      subject: 'math',
      categoryId: mathCategory.id,
      type: 'text',
      title: '证明：对角线互相平分的四边形是平行四边形。',
      score: 60,
      answer: '证明过程略。'
    },
    {
      subject: 'chinese',
      categoryId: chineseCategory.id,
      type: 'judge',
      title: '下列哪个成语是褒义词？',
      score: 100,
      options: { A: '处心积虑', B: '神机妙算', C: '同流合污', D: '口蜜腹剑' },
      answer: 'B'
    },
    {
      subject: 'english',
      categoryId: englishCategory.id,
      type: 'judge',
      title: 'What is the past tense of "go"?',
      score: 100,
      options: { A: 'gone', B: 'went', C: 'going', D: 'goes' },
      answer: 'B'
    },
    {
      subject: 'cs',
      categoryId: csCategory.id,
      type: 'judge',
      title: 'HTTP 协议默认端口号是多少？',
      score: 20,
      options: { A: '21', B: '80', C: '443', D: '8080' },
      answer: 'B'
    },
    {
      subject: 'cs',
      categoryId: csCategory.id,
      type: 'select',
      title: '该系统前端使用的技术栈包括？',
      score: 30,
      options: { A: 'Vue3', B: 'React', C: 'Vite', D: 'Pinia' },
      answers: ['A', 'C', 'D']
    },
    {
      subject: 'cs',
      categoryId: csCategory.id,
      type: 'text',
      title: '简述 Vue3 生命周期。',
      score: 50,
      answer: 'setup, onMounted, onUpdated, onUnmounted...'
    }
  ]

  for (const question of questionSeeds) {
    await ensureQuestion(question)
  }

  const usersWithClass = await prisma.sysUser.findMany({
    where: {
      username: {
        in: ['admin', 'teacher', 'student', 'student01', 'student02']
      }
    },
    include: {
      class: true
    }
  })
  const userMapByUsername = new Map(usersWithClass.map((item) => [item.username, item]))
  const adminProfile = userMapByUsername.get('admin')
  const teacherProfile = userMapByUsername.get('teacher')
  const studentProfile = userMapByUsername.get('student')
  const studentOneProfile = userMapByUsername.get('student01')
  const studentTwoProfile = userMapByUsername.get('student02')

  if (!adminProfile || !teacherProfile || !studentProfile || !studentOneProfile || !studentTwoProfile) {
    throw new Error('演示用户初始化失败')
  }

  const now = new Date()
  const futureStartTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const futureEndTime = new Date(futureStartTime.getTime() + 45 * 60 * 1000)
  const ongoingStartTime = new Date(now.getTime() - 20 * 60 * 1000)
  const ongoingEndTime = new Date(now.getTime() + 40 * 60 * 1000)
  const pastStartTime = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  const pastEndTime = new Date(pastStartTime.getTime() + 90 * 60 * 1000)

  await ensurePaper({
    paperName: '英语课前测验（待开始）',
    subject: 'english',
    duration: 45,
    startTime: futureStartTime,
    endTime: futureEndTime,
    status: 1,
    creatorId: teacher.id,
    classIds: [classTwo.id],
    questionTitles: ['What is the past tense of "go"?']
  })

  const ongoingPaper = await ensurePaper({
    paperName: '计算机基础随堂测试（监控演示）',
    subject: 'cs',
    duration: 60,
    startTime: ongoingStartTime,
    endTime: ongoingEndTime,
    status: 1,
    creatorId: teacher.id,
    classIds: [classOne.id],
    questionTitles: ['HTTP 协议默认端口号是多少？', '该系统前端使用的技术栈包括？', '简述 Vue3 生命周期。']
  })

  const finishedPaper = await ensurePaper({
    paperName: '数学单元测试（成绩统计演示）',
    subject: 'math',
    duration: 90,
    startTime: pastStartTime,
    endTime: pastEndTime,
    status: 1,
    creatorId: teacher.id,
    classIds: [classOne.id, classTwo.id],
    questionTitles: ['已知函数 f(x) = x^2, 求 f(2) = ?', '证明：对角线互相平分的四边形是平行四边形。']
  })

  const existingLogCount = await prisma.loginLog.count()
  if (existingLogCount === 0) {
    await prisma.loginLog.createMany({
      data: [
        createLoginLog('admin', 1, '登录成功', admin.id),
        createLoginLog('teacher', 1, '登录成功', teacher.id),
        createLoginLog('student', 1, '登录成功', student.id),
        createLoginLog('unknown', 0, '密码错误')
      ]
    })
  }

  for (const user of [adminProfile, teacherProfile, studentProfile, studentOneProfile, studentTwoProfile]) {
    await upsertDemoLoginLog(user)
  }

  const ongoingQuestionMap = buildPaperQuestionMap(ongoingPaper)
  const finishedQuestionMap = buildPaperQuestionMap(finishedPaper)

  const csJudgeQuestion = getPaperQuestionByTitle(ongoingQuestionMap, 'HTTP 协议默认端口号是多少？')
  const csSelectQuestion = getPaperQuestionByTitle(ongoingQuestionMap, '该系统前端使用的技术栈包括？')
  const csTextQuestion = getPaperQuestionByTitle(ongoingQuestionMap, '简述 Vue3 生命周期。')
  const mathJudgeQuestion = getPaperQuestionByTitle(finishedQuestionMap, '已知函数 f(x) = x^2, 求 f(2) = ?')
  const mathTextQuestion = getPaperQuestionByTitle(finishedQuestionMap, '证明：对角线互相平分的四边形是平行四边形。')

  await rebuildMarkedRecord({
    paper: ongoingPaper,
    student: studentOneProfile,
    startedAt: new Date(ongoingStartTime.getTime() + 2 * 60 * 1000),
    submitTime: new Date(now.getTime() - 6 * 60 * 1000),
    markedAt: new Date(now.getTime() - 3 * 60 * 1000),
    forcedSubmit: 1,
    cheatCount: 2,
    answerItems: [
      {
        questionId: csJudgeQuestion.questionId,
        paperQuestionId: csJudgeQuestion.id,
        type: 'judge',
        answer: 'B',
        isCorrect: 1,
        score: 20
      },
      {
        questionId: csSelectQuestion.questionId,
        paperQuestionId: csSelectQuestion.id,
        type: 'select',
        answer: ['A', 'C', 'D'],
        isCorrect: 1,
        score: 30
      },
      {
        questionId: csTextQuestion.questionId,
        paperQuestionId: csTextQuestion.id,
        type: 'text',
        answer: 'setup 中注册逻辑，组件挂载后触发 onMounted，更新时触发 onUpdated，卸载前触发 onUnmounted。',
        isCorrect: 1,
        score: 20,
        comment: '要点基本完整'
      }
    ]
  })

  await rebuildMarkedRecord({
    paper: finishedPaper,
    student: studentProfile,
    startedAt: new Date(pastStartTime.getTime() + 5 * 60 * 1000),
    submitTime: new Date(pastStartTime.getTime() + 55 * 60 * 1000),
    markedAt: new Date(pastEndTime.getTime() + 30 * 60 * 1000),
    answerItems: [
      {
        questionId: mathJudgeQuestion.questionId,
        paperQuestionId: mathJudgeQuestion.id,
        type: 'judge',
        answer: 'A',
        isCorrect: 0,
        score: 0
      },
      {
        questionId: mathTextQuestion.questionId,
        paperQuestionId: mathTextQuestion.id,
        type: 'text',
        answer: '设四边形 ABCD 的对角线交于点 O，且 AO = CO，BO = DO，可得两组对边平行，因此该四边形是平行四边形。',
        isCorrect: 1,
        score: 60,
        comment: '论证基本完整'
      }
    ],
    wrongBookItems: [
      {
        paperQuestionId: mathJudgeQuestion.id,
        questionId: mathJudgeQuestion.questionId,
        myAnswer: 'A',
        correctAnswer: 'B'
      }
    ]
  })

  await rebuildMarkedRecord({
    paper: finishedPaper,
    student: studentOneProfile,
    startedAt: new Date(pastStartTime.getTime() + 8 * 60 * 1000),
    submitTime: new Date(pastStartTime.getTime() + 40 * 60 * 1000),
    markedAt: new Date(pastEndTime.getTime() + 20 * 60 * 1000),
    answerItems: [
      {
        questionId: mathJudgeQuestion.questionId,
        paperQuestionId: mathJudgeQuestion.id,
        type: 'judge',
        answer: 'B',
        isCorrect: 1,
        score: 40
      },
      {
        questionId: mathTextQuestion.questionId,
        paperQuestionId: mathTextQuestion.id,
        type: 'text',
        answer: '连接对角线并设交点为 O，由 AO = CO、BO = DO 可知两条对角线互相平分，根据平行四边形判定定理可得四边形 ABCD 是平行四边形。',
        isCorrect: 1,
        score: 60,
        comment: '答案完整'
      }
    ]
  })

  await rebuildMarkedRecord({
    paper: finishedPaper,
    student: studentTwoProfile,
    startedAt: new Date(pastStartTime.getTime() + 10 * 60 * 1000),
    submitTime: new Date(pastStartTime.getTime() + 70 * 60 * 1000),
    markedAt: new Date(pastEndTime.getTime() + 45 * 60 * 1000),
    answerItems: [
      {
        questionId: mathJudgeQuestion.questionId,
        paperQuestionId: mathJudgeQuestion.id,
        type: 'judge',
        answer: 'B',
        isCorrect: 1,
        score: 40
      },
      {
        questionId: mathTextQuestion.questionId,
        paperQuestionId: mathTextQuestion.id,
        type: 'text',
        answer: '',
        isCorrect: 0,
        score: 0,
        comment: '未作答'
      }
    ]
  })

  await upsertMonitorLog({
    paperId: ongoingPaper.id,
    studentId: studentProfile.id,
    operatorId: teacherProfile.id,
    type: 'warn',
    content: '请保持考试页面在前台，切勿频繁切屏。'
  })

  await upsertMonitorLog({
    paperId: ongoingPaper.id,
    studentId: studentOneProfile.id,
    operatorId: teacherProfile.id,
    type: 'force_submit',
    content: '监考老师强制交卷'
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
