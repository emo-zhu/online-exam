import Router from '@koa/router'
import { roleGuard } from '../../common/middleware/roleGuard.js'
import { validate } from '../../common/middleware/validate.js'
import { logController } from './log.controller.js'
import { loginLogQuerySchema } from './log.schema.js'

export const logRouter = new Router({ prefix: '/login-logs' })

logRouter.use(roleGuard(['admin']))
logRouter.get('/', validate(loginLogQuerySchema, 'query'), logController.list)
logRouter.delete('/clear', logController.clear)
