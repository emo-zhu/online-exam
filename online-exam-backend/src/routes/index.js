import Router from '@koa/router'
import { success } from '../common/response/index.js'
import { authRouter } from '../modules/auth/auth.router.js'
import { userRouter } from '../modules/user/user.router.js'
import { classRouter } from '../modules/classinfo/classinfo.router.js'
import { noticeRouter } from '../modules/notice/notice.router.js'
import { logRouter } from '../modules/log/log.router.js'
import { questionCategoryRouter } from '../modules/questionCategory/questionCategory.router.js'
import { questionRouter } from '../modules/question/question.router.js'
import { paperRouter } from '../modules/paper/paper.router.js'
import { examRecordRouter } from '../modules/examRecord/examRecord.router.js'
import { monitorRouter } from '../modules/monitor/monitor.router.js'
import { scoreRouter } from '../modules/score/score.router.js'
import { subjectRouter } from '../modules/subject/subject.router.js'

export const router = new Router()
const apiRouter = new Router({ prefix: '/api/v1' })

apiRouter.get('/health', (ctx) => {
  success(ctx, { status: 'ok' })
})

apiRouter.use(authRouter.routes(), authRouter.allowedMethods())
apiRouter.use(userRouter.routes(), userRouter.allowedMethods())
apiRouter.use(classRouter.routes(), classRouter.allowedMethods())
apiRouter.use(noticeRouter.routes(), noticeRouter.allowedMethods())
apiRouter.use(logRouter.routes(), logRouter.allowedMethods())
apiRouter.use(questionCategoryRouter.routes(), questionCategoryRouter.allowedMethods())
apiRouter.use(questionRouter.routes(), questionRouter.allowedMethods())
apiRouter.use(paperRouter.routes(), paperRouter.allowedMethods())
apiRouter.use(examRecordRouter.routes(), examRecordRouter.allowedMethods())
apiRouter.use(monitorRouter.routes(), monitorRouter.allowedMethods())
apiRouter.use(scoreRouter.routes(), scoreRouter.allowedMethods())
apiRouter.use(subjectRouter.routes(), subjectRouter.allowedMethods())

router.use(apiRouter.routes(), apiRouter.allowedMethods())
