import Router from '@koa/router'
import { validate } from '../../common/middleware/validate.js'
import { authController } from './auth.controller.js'
import { changePasswordSchema, loginSchema, logoutSchema, refreshTokenSchema, registerSchema } from './auth.schema.js'

export const authRouter = new Router({ prefix: '/auth' })

authRouter.get('/captcha', authController.captcha)
authRouter.post('/login', validate(loginSchema), authController.login)
authRouter.post('/register', validate(registerSchema), authController.register)
authRouter.get('/me', authController.me)
authRouter.post('/logout', validate(logoutSchema), authController.logout)
authRouter.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken)
authRouter.put('/password', validate(changePasswordSchema), authController.changePassword)
