import { z } from 'zod'
import { AppError } from '../errors/appError.js'
import { ERROR_CODES } from '../constants/errorCodes.js'

export const validate = (schema, target = 'body') => async (ctx, next) => {
  const result = schema.safeParse(ctx.request[target])
  if (!result.success) {
    throw new AppError('参数校验失败', {
      code: ERROR_CODES.VALIDATION_ERROR,
      status: 400,
      data: result.error.flatten()
    })
  }

  ctx.request[target] = result.data
  await next()
}

export { z }
