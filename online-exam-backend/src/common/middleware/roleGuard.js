import { AppError } from '../errors/appError.js'
import { ERROR_CODES } from '../constants/errorCodes.js'

export const roleGuard = (allowedRoles = []) => async (ctx, next) => {
  if (allowedRoles.length === 0) {
    await next()
    return
  }

  const userRoles = ctx.state.user?.roles || []
  const hasPermission = allowedRoles.some((role) => userRoles.includes(role))

  if (!hasPermission) {
    throw new AppError('无权限访问', { code: ERROR_CODES.FORBIDDEN, status: 403 })
  }

  await next()
}
