import Router from '@koa/router'
import { roleGuard } from '../../common/middleware/roleGuard.js'
import { validate } from '../../common/middleware/validate.js'
import { questionCategoryController } from './questionCategory.controller.js'
import { createQuestionCategorySchema, questionCategoryIdParamsSchema, questionCategoryListQuerySchema, updateQuestionCategorySchema } from './questionCategory.schema.js'

export const questionCategoryRouter = new Router({ prefix: '/question-categories' })

questionCategoryRouter.use(roleGuard(['admin', 'teacher']))
questionCategoryRouter.get('/', validate(questionCategoryListQuerySchema, 'query'), questionCategoryController.list)
questionCategoryRouter.post('/', validate(createQuestionCategorySchema), questionCategoryController.create)
questionCategoryRouter.put('/:id', validate(questionCategoryIdParamsSchema, 'params'), validate(updateQuestionCategorySchema), questionCategoryController.update)
questionCategoryRouter.delete('/:id', validate(questionCategoryIdParamsSchema, 'params'), questionCategoryController.remove)
