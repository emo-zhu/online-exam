import Koa from 'koa'
import cors from '@koa/cors'
import helmet from 'koa-helmet'
import { koaBody } from 'koa-body'
import { env } from './config/env.js'
import { requestId } from './common/middleware/requestId.js'
import { accessLogger } from './common/middleware/accessLogger.js'
import { authMiddleware } from './common/middleware/authMiddleware.js'
import { router } from './routes/index.js'
import { errorHandler } from './common/middleware/errorHandler.js'

export const createApp = () => {
  const app = new Koa()

  app.use(errorHandler)
  app.use(requestId)
  app.use(cors({ origin: env.corsOrigin, credentials: true }))
  app.use(helmet())
  app.use(koaBody({
    multipart: true,
    jsonLimit: '2mb',
    formLimit: '2mb',
    textLimit: '2mb',
    parsedMethods: ['POST', 'PUT', 'PATCH', 'DELETE']
  }))
  app.use(accessLogger)
  app.use(authMiddleware)
  app.use(router.routes())
  app.use(router.allowedMethods())

  return app
}
