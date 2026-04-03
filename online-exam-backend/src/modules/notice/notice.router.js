import Router from '@koa/router'
import { roleGuard } from '../../common/middleware/roleGuard.js'
import { validate } from '../../common/middleware/validate.js'
import { noticeController } from './notice.controller.js'
import { createNoticeSchema, noticeIdParamsSchema, noticeListQuerySchema, updateNoticeSchema } from './notice.schema.js'

export const noticeRouter = new Router({ prefix: '/notices' })

noticeRouter.get('/', validate(noticeListQuerySchema, 'query'), roleGuard(['admin', 'teacher', 'student']), noticeController.list)
noticeRouter.post('/', roleGuard(['admin']), validate(createNoticeSchema), noticeController.create)
noticeRouter.put('/:id', roleGuard(['admin']), validate(noticeIdParamsSchema, 'params'), validate(updateNoticeSchema), noticeController.update)
noticeRouter.delete('/:id', roleGuard(['admin']), validate(noticeIdParamsSchema, 'params'), noticeController.remove)
