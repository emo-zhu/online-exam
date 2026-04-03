import Router from '@koa/router'
import { roleGuard } from '../../common/middleware/roleGuard.js'
import { validate } from '../../common/middleware/validate.js'
import { classController } from './classinfo.controller.js'
import { classIdParamsSchema, classListQuerySchema, createClassSchema, updateClassSchema } from './classinfo.schema.js'

export const classRouter = new Router({ prefix: '/classes' })

classRouter.get('/', roleGuard(['admin', 'teacher']), validate(classListQuerySchema, 'query'), classController.list)
classRouter.post('/', roleGuard(['admin']), validate(createClassSchema), classController.create)
classRouter.put('/:id', roleGuard(['admin']), validate(classIdParamsSchema, 'params'), validate(updateClassSchema), classController.update)
classRouter.delete('/:id', roleGuard(['admin']), validate(classIdParamsSchema, 'params'), classController.remove)
classRouter.post('/:id/reset-code', roleGuard(['admin']), validate(classIdParamsSchema, 'params'), classController.resetCode)
