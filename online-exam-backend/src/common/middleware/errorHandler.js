import { AppError } from '../errors/appError.js'
import { ERROR_CODES } from '../constants/errorCodes.js'
import { fail } from '../response/index.js'

export const errorHandler = async (ctx, next) => {
  try {
    await next()
    if (ctx.status === 404 && !ctx.body) {
      fail(ctx, {
        code: ERROR_CODES.NOT_FOUND,
        message: '资源不存在',
        data: null,
        status: 404
      })
    }
  } catch (error) {
    if (error instanceof AppError) {
      fail(ctx, {
        code: error.code,
        message: error.message,
        data: error.data,
        status: error.status
      })
      return
    }

    console.error(error)
    fail(ctx, {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: '服务器内部错误',
      data: null,
      status: 500
    })
  }
}
