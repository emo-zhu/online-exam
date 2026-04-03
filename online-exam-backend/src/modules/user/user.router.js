import Router from '@koa/router'
import { roleGuard } from '../../common/middleware/roleGuard.js'
import { validate } from '../../common/middleware/validate.js'
import { userController } from './user.controller.js'
import { batchDeleteUsersSchema, createUserSchema, resetPasswordSchema, updateUserSchema, updateUserStatusSchema, userExportQuerySchema, userIdParamsSchema, userListQuerySchema } from './user.schema.js'

export const userRouter = new Router({ prefix: '/users' })

userRouter.use(roleGuard(['admin']))
userRouter.get('/', validate(userListQuerySchema, 'query'), userController.list)
userRouter.post('/', validate(createUserSchema), userController.create)
userRouter.post('/import', userController.import)
userRouter.get('/export', validate(userExportQuerySchema, 'query'), userController.export)
userRouter.put('/:id', validate(userIdParamsSchema, 'params'), validate(updateUserSchema), userController.update)
userRouter.patch('/:id/status', validate(userIdParamsSchema, 'params'), validate(updateUserStatusSchema), userController.updateStatus)
userRouter.post('/:id/reset-password', validate(userIdParamsSchema, 'params'), validate(resetPasswordSchema), userController.resetPassword)
userRouter.delete('/batch', validate(batchDeleteUsersSchema), userController.batchRemove)
userRouter.delete('/:id', validate(userIdParamsSchema, 'params'), userController.remove)
