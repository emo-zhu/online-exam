import Router from '@koa/router'
import { roleGuard } from '../../common/middleware/roleGuard.js'
import { validate } from '../../common/middleware/validate.js'
import { monitorController } from './monitor.controller.js'
import { monitorForceSubmitSchema, monitorLogQuerySchema, monitorWarnSchema, paperIdParamsSchema } from './monitor.schema.js'

export const monitorRouter = new Router({ prefix: '/monitor' })

monitorRouter.use(roleGuard(['admin', 'teacher']))
monitorRouter.get('/stream', monitorController.stream)
monitorRouter.get('/active-exams', monitorController.listActiveExams)
monitorRouter.get('/exams/:paperId/students', validate(paperIdParamsSchema, 'params'), monitorController.listExamStudents)
monitorRouter.post('/exams/:paperId/warn', validate(paperIdParamsSchema, 'params'), validate(monitorWarnSchema), monitorController.warnStudent)
monitorRouter.post('/exams/:paperId/force-submit', validate(paperIdParamsSchema, 'params'), validate(monitorForceSubmitSchema), monitorController.forceSubmitStudent)
monitorRouter.get('/logs', validate(monitorLogQuerySchema, 'query'), monitorController.listLogs)
