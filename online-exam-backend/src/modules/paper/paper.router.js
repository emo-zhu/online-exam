import Router from '@koa/router'
import { roleGuard } from '../../common/middleware/roleGuard.js'
import { validate } from '../../common/middleware/validate.js'
import { paperController } from './paper.controller.js'
import { createPaperSchema, paperIdParamsSchema, paperListQuerySchema, updatePaperSchema, updatePaperStatusSchema } from './paper.schema.js'

export const paperRouter = new Router({ prefix: '/papers' })

paperRouter.get('/', roleGuard(['admin', 'teacher']), validate(paperListQuerySchema, 'query'), paperController.list)
paperRouter.get('/:id', roleGuard(['admin', 'teacher']), validate(paperIdParamsSchema, 'params'), paperController.detail)
paperRouter.post('/', roleGuard(['admin', 'teacher']), validate(createPaperSchema), paperController.create)
paperRouter.put('/:id', roleGuard(['admin', 'teacher']), validate(paperIdParamsSchema, 'params'), validate(updatePaperSchema), paperController.update)
paperRouter.patch('/:id/status', roleGuard(['admin', 'teacher']), validate(paperIdParamsSchema, 'params'), validate(updatePaperStatusSchema), paperController.updateStatus)
paperRouter.delete('/:id', roleGuard(['admin', 'teacher']), validate(paperIdParamsSchema, 'params'), paperController.remove)
