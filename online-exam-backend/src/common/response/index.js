import { ERROR_CODES } from '../constants/errorCodes.js'
import { serialize } from '../utils/serialize.js'

export const success = (ctx, data = null, message = 'success', code = ERROR_CODES.SUCCESS) => {
  ctx.status = 200
  ctx.body = {
    code,
    message,
    data: serialize(data),
    requestId: ctx.state.requestId || null
  }
}

export const fail = (ctx, { code = ERROR_CODES.BAD_REQUEST, message = '业务处理失败', data = null, status = 200 } = {}) => {
  ctx.status = status
  ctx.body = {
    code,
    message,
    data: serialize(data),
    requestId: ctx.state.requestId || null
  }
}
