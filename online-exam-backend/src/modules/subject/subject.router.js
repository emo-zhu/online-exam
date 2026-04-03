import Router from '@koa/router'
import { roleGuard } from '../../common/middleware/roleGuard.js'
import { validate } from '../../common/middleware/validate.js'
import { subjectController } from './subject.controller.js'
import { createSubjectSchema, subjectIdParamsSchema, subjectListQuerySchema, updateSubjectSchema } from './subject.schema.js'

export const subjectRouter = new Router({ prefix: '/subjects' })

subjectRouter.get('/', validate(subjectListQuerySchema, 'query'), subjectController.list)
subjectRouter.post('/', roleGuard(['admin', 'teacher']), validate(createSubjectSchema), subjectController.create)
subjectRouter.put('/:id', roleGuard(['admin', 'teacher']), validate(subjectIdParamsSchema, 'params'), validate(updateSubjectSchema), subjectController.update)
subjectRouter.delete('/:id', roleGuard(['admin', 'teacher']), validate(subjectIdParamsSchema, 'params'), subjectController.remove)
