import Router from '@koa/router'
import { roleGuard } from '../../common/middleware/roleGuard.js'
import { validate } from '../../common/middleware/validate.js'
import { questionController } from './question.controller.js'
import { batchDeleteQuestionsSchema, createQuestionSchema, questionIdParamsSchema, questionListQuerySchema, updateQuestionSchema } from './question.schema.js'

export const questionRouter = new Router({ prefix: '/questions' })

questionRouter.get('/content-images/:filename', questionController.getContentImage)
questionRouter.use(roleGuard(['admin', 'teacher']))
questionRouter.get('/', validate(questionListQuerySchema, 'query'), questionController.list)
questionRouter.post('/content-images', questionController.uploadContentImage)
questionRouter.post('/', validate(createQuestionSchema), questionController.create)
questionRouter.put('/:id', validate(questionIdParamsSchema, 'params'), validate(updateQuestionSchema), questionController.update)
questionRouter.delete('/batch', validate(batchDeleteQuestionsSchema), questionController.batchRemove)
questionRouter.delete('/:id', validate(questionIdParamsSchema, 'params'), questionController.remove)
