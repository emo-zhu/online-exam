import Router from '@koa/router'
import { roleGuard } from '../../common/middleware/roleGuard.js'
import { validate } from '../../common/middleware/validate.js'
import { scoreController } from './score.controller.js'
import { scoreExportQuerySchema, scoreListQuerySchema, scoreStatsQuerySchema } from './score.schema.js'

export const scoreRouter = new Router({ prefix: '/scores' })

scoreRouter.use(roleGuard(['admin', 'teacher']))
scoreRouter.get('/', validate(scoreListQuerySchema, 'query'), scoreController.list)
scoreRouter.get('/stats', validate(scoreStatsQuerySchema, 'query'), scoreController.stats)
scoreRouter.get('/export', validate(scoreExportQuerySchema, 'query'), scoreController.export)
